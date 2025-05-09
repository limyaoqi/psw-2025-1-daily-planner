export async function GET() {
  try {
    const response = await fetch("https://api.quotable.io/random");
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch quote" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}