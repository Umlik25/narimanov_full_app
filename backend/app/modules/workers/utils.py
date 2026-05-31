from math import atan2, cos, degrees, radians, sin


def calculate_bearing_degrees(
    start_latitude: float,
    start_longitude: float,
    end_latitude: float,
    end_longitude: float,
) -> float:
    """
    Return the compass bearing from the start point to the end point.

    The result is normalized to the range [0, 360), where 0 means north and
    values increase clockwise.
    """
    start_lat = radians(start_latitude)
    end_lat = radians(end_latitude)
    delta_longitude = radians(end_longitude - start_longitude)

    y = sin(delta_longitude) * cos(end_lat)
    x = cos(start_lat) * sin(end_lat) - sin(start_lat) * cos(end_lat) * cos(
        delta_longitude
    )

    bearing = degrees(atan2(y, x))
    return (bearing + 360) % 360
