import { getExcelData } from "@/lib/excel";

export const runtime = "nodejs";

//GET is an HTTP request method.
// 200	OK – Request successful
// 201	Created – New information created
// 400	Bad Request
// 401	Unauthorized
// 403	Forbidden
// 404	Not Found
// 500	Internal Server Error

export async function GET() {
  try {
    const data = getExcelData();

    // return a JSON
    return Response.json({
      success: true,
      totalQuestions: data.length,
      data,
    });
  } catch (error) {
    console.error("Failed to load FAQ data.", error);

    // for error
    return Response.json(
      {
        success: false,
        error: "Unable to load FAQ data.",
      },
      { status: 500 },
    );
  }
}
