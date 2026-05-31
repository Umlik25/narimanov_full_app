Create a complete mobile app UI design for a hackathon project called “City Grind”.

Project Overview

City Grind is a district operations platform for Narimanov district in Baku. The goal of the platform is to help the district administration detect, register, review, assign, monitor, and resolve urban infrastructure issues.

The mobile application should be designed separately from the web dashboard. The mobile app should not look like a web dashboard squeezed into a phone. It should be mobile-first, map-first, simple, clean, role-based, and action-focused.

The app has two roles:

1. User
2. Admin

The User role is for citizens or inspectors who report issues and track their own reports.

The Admin role is for district administrators who monitor all issues, review AI detections, assign tasks, manage operations, and view analytics.

Core Product Story

The full product story is:

User reports an issue → Issue appears on map → AI suggests category and priority → Admin reviews issues and AI detections → Admin assigns task → Issue is tracked → Issue is resolved → User and Admin can view status updates

The mobile app should focus on this flow:

Login / Sign up → Map → Select issue/task → View details → Report issue / Manage issue → AI Assistant

Design Style

Use the uploaded sample mobile app as inspiration. The style should be:

- Map-first layout
- Large rounded bottom sheets
- Minimal cards
- Floating action buttons
- Clean hamburger menu
- Soft shadows
- Large readable text
- Simple icon buttons
- Very few charts
- No crowded dashboard tables
- Smooth mobile interactions
- Modern, clean, premium mobile UI
- Light background
- White cards
- Clear visual hierarchy

Color System

Use this color direction:

- Primary blue for main actions
- Purple for AI-related features
- Red for overdue / critical issues
- Green for resolved / approved actions
- Orange for assigned / in-progress states
- Light gray background
- White cards
- Dark navy text

Suggested colors:

- Primary Blue: #0B5CFF
- Dark Navy: #08122D
- Purple AI: #7C3AED
- Red Critical: #E53935
- Green Success: #16A34A
- Orange Progress: #F97316
- Light Background: #F5F7FB
- Card White: #FFFFFF

Important Mobile UI Rules

- Do not overload the screen.
- Avoid web-style dashboard grids.
- Use bottom sheets instead of large complex pages when possible.
- Keep user screens simple.
- Keep admin screens powerful but still minimal.
- The map should feel like the main workspace.
- Every major action should be reachable in 1 to 2 taps.
- Use clear role-based menus.
- User and Admin screens should look related but not identical.
- Use realistic map, report, road damage, flooding, trash, lighting, and city infrastructure visuals.
- Use clean mobile spacing.
- Use rounded corners and soft shadows.
- Keep all text readable.
- Avoid tiny UI elements.
- Design in a modern iOS/Android-friendly style.

Map Requirement

The map is the most important part of the mobile app.

The map must:

- Start centered on Narimanov district, Baku
- Allow sliding / panning freely
- Allow zoom in and zoom out
- Show current user location if permission is granted
- Show markers based on the selected role
- Support tapping markers to open an issue bottom sheet
- Have clean floating controls for current location, zoom, filters, AI assistant, and report issue

Starting map location:

Latitude: 40.4093
Longitude: 49.8671

The map should not look static. It should feel like a real interactive map screen where users can move around, zoom in/out, and tap markers.

Marker Colors

Use these marker colors:

- New = blue
- AI Review = purple
- Assigned = orange
- In Progress = amber/orange
- Resolved = green
- Overdue = red
- Rejected = gray

Final Mobile Screens to Design

Create the following mobile app screens.

1. Welcome / Login Page

Purpose:
Allow the user or admin to enter the app.

Must include:

- City Grind logo
- Email or phone number input
- Password input
- Role selector: User / Admin
- Login button
- Sign up link
- Clean city/district visual
- Simple demo options: Continue as User, Continue as Admin

Role behavior:

- User login opens the User Main Map Screen
- Admin login opens the Admin Main Map Screen

Design direction:
Keep it clean, modern, and mobile-friendly. Do not make it look like a heavy dashboard. Use a city or district visual, but keep the form simple and readable.

2. Sign Up Page

Purpose:
Allow a new normal user to create an account.

Must include:

- Full name
- Phone number or email
- Password
- Confirm password
- Create account button
- Back to login

Important:
Sign up should be for User only by default. Admin accounts should not be freely created. For demo purposes, admin can be selected from the login page.

3. User Main Map Screen

Purpose:
Main home screen for normal users.

The User sees:

- Map centered on Narimanov district
- Their own submitted reports
- Nearby public issue markers if needed
- Search location bar
- Hamburger menu button
- Floating “Report Issue” button
- Floating AI Assistant button
- Current location button
- Zoom controls if needed

The User should not see:

- Admin controls
- All district tasks
- AI Review controls
- Analytics
- Assignment controls

User marker behavior:

- User report markers should be visible
- Marker tap opens Issue Bottom Sheet
- User should only see their own reports clearly

Design direction:
This should look like a modern map app. Keep the interface minimal. Use floating buttons and bottom sheets.

4. Admin Main Map Screen

Purpose:
Main home screen for admin.

The Admin sees:

- Map centered on Narimanov district
- All active issues
- AI-detected issues
- Overdue issues
- Status-colored markers
- Search location bar
- Filter button
- Hamburger menu button
- Floating AI Assistant button
- Current location button
- Zoom controls if needed

Admin marker behavior:

- Admin can see all district issue markers
- Marker tap opens Issue Bottom Sheet
- Admin can open issue details, assign issue, or review AI detection

Design direction:
This should still be simple and map-first, but admin should have more control. Use status filters and colored markers clearly.

5. Issue Bottom Sheet on Map

Purpose:
When a marker is tapped, show quick issue details without leaving the map.

This should work like a modern mobile bottom sheet.

Must include:

- Drag handle
- Issue title
- Issue photo
- Category
- Priority
- Status
- Location
- Reported time
- Short description
- View Details button

User bottom sheet actions:

- View Details
- Track Status
- Add Comment
- Add Extra Photo

Admin bottom sheet actions:

- View Details
- Assign
- Change Status
- Review AI if AI-detected

Design direction:
Use large rounded top corners, clean spacing, and compact content. Do not overcrowd the sheet.

6. User Report Issue Page

Purpose:
Allow users to submit a new issue.

Must include:

- Add photo / take photo
- Category selection
- Description input
- Location picker / current location
- AI suggestion preview
- Submit report button

AI suggestion preview should include:

- Suggested category
- Suggested priority
- Suggested department
- Confidence score

Behavior:

- User can upload or take photo
- User can select or confirm location
- User can describe the problem
- AI suggestion appears after photo/description
- Submit creates a new report
- After submit, user returns to map or My Reports

Design direction:
This is one of the most important user features. Make it clean, step-based, and easy to understand. Do not make the form too long or crowded.

7. User My Reports Page

Purpose:
User sees only their own submitted reports.

Must include:

- List of user reports
- Status badge
- Category
- Date submitted
- Small photo thumbnail
- Track Progress button

Statuses:

- Submitted
- Under Review
- Assigned
- In Progress
- Resolved
- Rejected

Design direction:
This page replaces any admin dashboard for the normal user. It should be simple, card-based, and easy to scan.

8. User Report Details Page

Purpose:
User tracks one submitted report.

Must include:

- Report photo
- Title
- Description
- Category
- Priority
- Status
- Location
- Timeline
- Admin updates
- Resolution proof if resolved

User actions:

- Add comment
- Add extra photo
- Open on map

User should not see:

- Assign department
- Reject issue
- Admin status controls
- Analytics controls

Design direction:
Make the status timeline clear and reassuring. The user should understand what is happening with their report.

9. Admin Issue Details Page

Purpose:
Admin manages one issue.

Must include:

- Issue photo
- Title
- Description
- Category
- Priority
- Status
- Location
- Source: user / AI / camera
- Assigned department
- Deadline
- Timeline / audit trail

Admin actions:

- Assign department
- Set deadline
- Start progress
- Mark resolved
- Reject issue
- Open on map

Design direction:
This is the mobile version of the web Issue Details / Assignment page. Keep it powerful but not crowded. Use clear action buttons.

10. Admin AI Review Page

Purpose:
Admin reviews AI/CV detections.

Must include:

- AI detection cards
- Image / snapshot
- Detected category
- Confidence
- Priority
- Location
- Approve button
- Reject button
- Merge button

Actions:

- Approve creates official issue
- Reject removes detection
- Merge attaches detection to existing issue

Design direction:
This page proves the AI/CV innovation feature. Use purple AI styling, confidence badges, clean cards, and clear approve/reject/merge actions.

11. Admin Operations / Tasks Page

Purpose:
Admin sees operational task progress.

Must include:

- Assigned tasks
- Department
- Priority
- Deadline
- Status
- Responsible team
- Progress

Admin actions:

- Open task
- Reassign
- Change deadline
- Mark resolved if needed

Important:
This is not a personal worker task page. Since the mobile app has only Admin and User, Admin controls operations.

Design direction:
Use compact task cards with clear status and priority badges.

12. Admin Analytics Summary Page

Purpose:
Lightweight mobile analytics for admin.

Must include:

- Total issues
- Resolved issues
- Overdue issues
- AI detections
- Resolution rate
- Top categories
- Top locations

Design direction:

- Simple cards
- Small progress bars
- Minimal charts
- No crowded dashboard
- No large tables
- Much lighter than the web analytics page

13. AI Chatbot Page / Modal

Purpose:
Both User and Admin can ask questions.

This can open from:

- Floating AI button on map
- Hamburger menu
- Issue details page

User AI Assistant can answer:

- How do I report an issue?
- What is the status of my report?
- Where is my submitted issue?
- What does “assigned” mean?
- How long does resolution take?

Admin AI Assistant can answer:

- Which issues are urgent?
- Summarize today’s district problems
- Show overdue issues
- Which area has the most reports?
- Which AI detections need review?

Design:

- Chat-style screen or modal
- Suggested quick questions
- Message bubbles
- Simple input field
- Send button
- Clean and minimal
- Use purple/blue AI styling

14. Hamburger Menu - User Version

Purpose:
Role-based navigation for normal users.

User Menu should include:

- Map
- Report Issue
- My Reports
- AI Assistant
- Profile
- Logout

User Menu should not include:

- Admin Dashboard
- AI Review
- Analytics
- Assignments
- All Tasks
- Admin operations

Design direction:
Use a clean side drawer or bottom drawer style. Keep it minimal.

15. Hamburger Menu - Admin Version

Purpose:
Role-based navigation for admin.

Admin Menu should include:

- Map
- AI Review
- All Issues
- Operations / Tasks
- Analytics Summary
- AI Assistant
- Profile
- Logout

Admin may also access Report Issue if needed, but it should not be the main admin feature.

Design direction:
Admin menu can have more items than user menu, but it should still be clean and easy to scan.

16. Profile Page

Purpose:
Account and role information.

Must include:

- Name
- Phone/email
- Role: User or Admin
- Edit profile
- Notification settings
- Logout

For demo:

- Switch role: User / Admin

Design direction:
Use clean profile cards, similar to modern mobile app settings pages.

Best Demo Flow

User Flow:

1. User logs in.
2. User sees map centered on Narimanov district.
3. User can slide the map and zoom in/out.
4. User taps Report Issue.
5. User uploads photo and description.
6. AI suggests category and priority.
7. User submits report.
8. Report appears on the map.
9. User opens My Reports.
10. User opens report details and tracks status.
11. User asks AI assistant about the report status.

Admin Flow:

1. Admin logs in.
2. Admin sees map centered on Narimanov district.
3. Admin can slide the map and zoom in/out.
4. Admin sees all district issues on the map.
5. Admin opens AI Review.
6. Admin approves AI detection.
7. Admin opens issue details.
8. Admin assigns department and deadline.
9. Admin checks operations/tasks.
10. Admin views analytics summary.
11. Admin asks AI assistant which issues are urgent.

Recommended UI Image Generation Order

Please create the screens in this order:

1. Login Page
2. User Main Map Screen
3. Admin Main Map Screen
4. Issue Bottom Sheet on Map
5. User Report Issue Page
6. User My Reports Page
7. User Report Details Page
8. Admin AI Review Page
9. Admin Issue Details Page
10. Admin Operations / Tasks Page
11. Admin Analytics Summary Page
12. AI Chatbot Page
13. Hamburger Menu - User Version
14. Hamburger Menu - Admin Version
15. Profile Page
16. Sign Up Page

Final Requirements

The final Figma design should include:

- All 16 mobile screens
- Consistent visual style across all screens
- User and Admin role separation
- Map-first design
- Bottom sheets for map interactions
- Clean navigation
- AI assistant included
- Status-based markers
- Minimal but premium UI
- No overcrowded mobile screens
- No web-dashboard-like layouts
- Design suitable for React Native / Expo implementation