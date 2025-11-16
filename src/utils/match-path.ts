export function matchPath(routePath: string, requestPath: string): boolean {
  const routeSegments = routePath.split("/").filter(Boolean);
  const requestSegments = requestPath.split("/").filter(Boolean);

  // different number of segments → not a match
  if (routeSegments.length !== requestSegments.length)
    return false;

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];
    const requestSegment = requestSegments[i];

    // match if segment is parameter or equal
    if (!routeSegment.startsWith(":") && routeSegment !== requestSegment) {
      return false;
    }
  }

  return true;
}
