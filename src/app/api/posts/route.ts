import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { isAuthorized } from "@/lib/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("blog");
    const posts = await db.collection("posts").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/posts", error);
    return NextResponse.json({ error: "Erro ao buscar posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { title, content, slug, categories } = data;

    if (!title || !content || !slug || !categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes ou inválidos" }, { status: 400 });
    }

    const newPost: Omit<Post, "_id"> = {
      title,
      content,
      slug,
      categories,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const client = await clientPromise;
    const db = client.db("blog");

    const exists = await db.collection("posts").findOne({ slug });
    if (exists) {
      return NextResponse.json({ error: "Slug já existe" }, { status: 409 });
    }

    await db.collection("posts").insertOne(newPost);
    return NextResponse.json({ message: "Post criado com sucesso", post: newPost }, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts", error);
    return NextResponse.json({ error: "Erro interno ao criar post" }, { status: 500 });
  }
}
