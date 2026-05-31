import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const distDir = path.resolve(process.cwd(), 'dist')
const host = process.env.HOST || '0.0.0.0'
const requestedPort = readPort()
const backendTarget = process.env.VITE_BACKEND_PROXY_TARGET || 'http://main-server:8989'
const certDir = path.join(os.tmpdir(), 'city-grind-pwa-https')
const caKeyPath = path.join(certDir, 'ca.key')
const caCertPath = path.join(certDir, 'ca.pem')
const serverKeyPath = path.join(certDir, 'server.key')
const serverCsrPath = path.join(certDir, 'server.csr')
const serverCertPath = path.join(certDir, 'server.crt')
const serverConfigPath = path.join(certDir, 'server.cnf')

if (!existsSync(distDir)) {
  console.error(`Build output not found at ${distDir}. Run "npm run build" first.`)
  process.exit(1)
}

mkdirSync(certDir, { recursive: true })

const localHosts = collectLocalHosts()
ensureCertificates(localHosts)

const tlsOptions = {
  key: readFileSync(serverKeyPath),
  cert: readFileSync(serverCertPath),
}

const server = https.createServer(tlsOptions, async (req, res) => {
  if (!req.url || !req.method) {
    res.statusCode = 400
    res.end('Bad request')
    return
  }

  const requestUrl = new URL(req.url, `https://${req.headers.host || host}`)

  if (requestUrl.pathname.startsWith('/backend-asset')) {
    proxyBackendAssetRequest(req, res, requestUrl)
    return
  }

  if (requestUrl.pathname.startsWith('/backend')) {
    proxyBackendRequest(req, res, requestUrl)
    return
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.end()
    return
  }

  let filePath = decodeURIComponent(requestUrl.pathname)

  if (filePath === '/') filePath = '/index.html'

  const resolvedPath = path.resolve(distDir, `.${filePath}`)
  if (!resolvedPath.startsWith(distDir)) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }

  const fileExists = await exists(resolvedPath)
  const hasExtension = path.extname(filePath).length > 0

  if (!fileExists) {
    if (!hasExtension) {
      await sendFile(res, path.join(distDir, 'index.html'))
      return
    }

    res.statusCode = 404
    res.end('Not found')
    return
  }

  await sendFile(res, resolvedPath, req.method === 'HEAD')
})

await listenWithFallback(server, requestedPort, host)

function collectLocalHosts() {
  const hosts = new Set(['localhost', '127.0.0.1'])
  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const info of interfaces || []) {
      if (info && info.family === 'IPv4' && !info.internal) {
        hosts.add(info.address)
      }
    }
  }
  return [...hosts]
}

function proxyBackendRequest(req, res, requestUrl) {
  const targetUrl = new URL(backendTarget)
  const backendPath = requestUrl.pathname.replace(/^\/backend/, '') || '/'
  const proxyUrl = new URL(`${backendPath}${requestUrl.search}`, targetUrl)
  proxyRequest(req, res, proxyUrl, targetUrl, 'Backend proxy failed')
}

function proxyBackendAssetRequest(req, res, requestUrl) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.end()
    return
  }

  const rawUrl = requestUrl.searchParams.get('url')
  if (!rawUrl) {
    res.statusCode = 400
    res.setHeader('X-City-Grind-Proxy', 'backend-asset')
    res.end('Missing asset URL')
    return
  }

  let proxyUrl
  try {
    proxyUrl = new URL(rawUrl)
  } catch {
    res.statusCode = 400
    res.setHeader('X-City-Grind-Proxy', 'backend-asset')
    res.end('Invalid asset URL')
    return
  }

  if (proxyUrl.hostname === 'main-server' && proxyUrl.protocol === 'https:') {
    proxyUrl.protocol = 'http:'
  }

  proxyRequest(req, res, proxyUrl, proxyUrl, 'Backend asset proxy failed')
}

function proxyRequest(req, res, proxyUrl, targetUrl, errorMessage) {
  const transport = proxyUrl.protocol === 'https:' ? https : http

  const proxyReq = transport.request(proxyUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrl.host,
      origin: targetUrl.origin,
      referer: targetUrl.origin,
    },
  }, proxyRes => {
    const headers = {
      ...proxyRes.headers,
      'cache-control': 'no-store',
      'x-city-grind-proxy': 'active',
    }
    delete headers['content-security-policy']
    res.writeHead(proxyRes.statusCode || 502, headers)
    proxyRes.pipe(res)
  })

  proxyReq.on('error', error => {
    console.error(`${errorMessage} for ${proxyUrl.href}`, error)
    if (!res.headersSent) {
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
    }
    res.end(JSON.stringify({ error: errorMessage }))
  })

  req.pipe(proxyReq)
}

function readPort() {
  const envPort = process.env.PORT
  if (envPort !== undefined) {
    const parsed = Number(envPort)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed
    }
  }

  const argPort = process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1]
  if (argPort !== undefined) {
    const parsed = Number(argPort)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed
    }
  }

  return 4173
}

function listenWithFallback(serverInstance, initialPort, listenHost) {
  return new Promise((resolve, reject) => {
    let didLogStartup = false

    const tryPort = (portToTry) => {
      serverInstance.once('error', onError)
      serverInstance.listen(portToTry, listenHost, () => {
        serverInstance.off('error', onError)
        if (didLogStartup) {
          return
        }
        didLogStartup = true

        const address = serverInstance.address()
        const actualPort = typeof address === 'object' && address ? address.port : portToTry

        console.log(`HTTPS preview running at https://${formatHost(listenHost)}:${actualPort}/`)
        console.log(`Android trust certificate: ${caCertPath}`)
        console.log(`Open this on Android: https://${localHosts.find(value => /^\d+\.\d+\.\d+\.\d+$/.test(value)) || 'your-laptop-ip'}:${actualPort}/`)
        console.log(`Local IPs available: ${localHosts.filter(value => value !== 'localhost' && value !== '127.0.0.1').join(', ') || 'none detected'}`)
        resolve()
      })
    }

    const onError = (error) => {
      serverInstance.off('error', onError)

      if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
        const nextPort = initialPort === 0 ? 0 : Number((serverInstance.address()?.port || initialPort)) + 1
        console.warn(`Port ${initialPort} is in use, trying ${nextPort === 0 ? 'an available port' : nextPort}...`)
        setImmediate(() => tryPort(nextPort))
        return
      }

      reject(error)
    }

    tryPort(initialPort)
  })
}

function ensureCertificates(localHosts) {
  if (!existsSync(caKeyPath) || !existsSync(caCertPath)) {
    execFileSync('openssl', [
      'req',
      '-x509',
      '-new',
      '-nodes',
      '-newkey',
      'rsa:2048',
      '-days',
      '825',
      '-keyout',
      caKeyPath,
      '-out',
      caCertPath,
      '-subj',
      '/CN=City Grind Local Dev CA',
    ], { stdio: 'ignore' })
  }

  writeFileSync(serverConfigPath, buildOpenSslConfig(localHosts))

  execFileSync('openssl', [
    'req',
    '-new',
    '-nodes',
    '-newkey',
    'rsa:2048',
    '-keyout',
    serverKeyPath,
    '-out',
    serverCsrPath,
    '-config',
    serverConfigPath,
  ], { stdio: 'ignore' })

  execFileSync('openssl', [
    'x509',
    '-req',
    '-in',
    serverCsrPath,
    '-CA',
    caCertPath,
    '-CAkey',
    caKeyPath,
    '-CAcreateserial',
    '-out',
    serverCertPath,
    '-days',
    '825',
    '-sha256',
    '-extfile',
    serverConfigPath,
    '-extensions',
    'v3_req',
  ], { stdio: 'ignore' })
}

function buildOpenSslConfig(localHosts) {
  const filteredAltNames = localHosts.map((value, index) => {
    if (/^\d+\.\d+\.\d+\.\d+$/.test(value)) {
      return `IP.${index + 1} = ${value}`
    }
    return `DNS.${index + 1} = ${value}`
  })

  return [
    '[req]',
    'default_bits = 2048',
    'prompt = no',
    'default_md = sha256',
    'distinguished_name = dn',
    'req_extensions = v3_req',
    '',
    '[dn]',
    'CN = City Grind Local Dev Server',
    '',
    '[v3_req]',
    'subjectAltName = @alt_names',
    'extendedKeyUsage = serverAuth',
    'keyUsage = digitalSignature, keyEncipherment',
    '',
    '[alt_names]',
    ...filteredAltNames,
    '',
  ].join('\n')
}

async function exists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function sendFile(res, filePath, headOnly = false) {
  const contentType = getContentType(filePath)
  const isHtml = contentType === 'text/html; charset=utf-8'
  res.statusCode = 200
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', isHtml ? 'no-cache' : 'public, max-age=31536000, immutable')
  if (headOnly) {
    res.end()
    return
  }

  createReadStream(filePath).pipe(res)
}

function getContentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'application/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
    case '.webmanifest':
      return 'application/manifest+json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.ico':
      return 'image/x-icon'
    case '.txt':
      return 'text/plain; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

function formatHost(value) {
  return value === '0.0.0.0' ? 'localhost' : value
}
