export async function ALL() {
  return Response.json(
    { error: "This route does not exist please select a report" },
    { status: 404 },
  );
}
