import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("blog");
    const categories: string[] = await db.collection("posts").distinct("categories");
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/categories", error);
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}
