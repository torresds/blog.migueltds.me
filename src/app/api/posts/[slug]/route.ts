import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { isAuthorized } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("blog");
    const post: Post | null = await db.collection("posts").findOne({ slug: params.slug }) as Post;
    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error(`GET /api/posts/${params.slug}`, error);
    return NextResponse.json({ error: "Erro interno ao buscar post" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { title, content, categories } = data;

    if (!title && !content && !categories) {
      return NextResponse.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
    }

    const updateData: Partial<Post> = {
      ...(title && { title }),
      ...(content && { content }),
      ...(categories && Array.isArray(categories) && { categories }),
      updatedAt: Date.now(),
    };

    const client = await clientPromise;
    const db = client.db("blog");
    const result = await db.collection("posts").updateOne(
      { slug: params.slug },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post atualizado com sucesso" });
  } catch (error) {
    console.error(`PUT /api/posts/${params.slug}`, error);
    return NextResponse.json({ error: "Erro interno ao atualizar post" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("blog");
    const result = await db.collection("posts").deleteOne({ slug: params.slug });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post removido com sucesso" });
  } catch (error) {
    console.error(`DELETE /api/posts/${params.slug}`, error);
    return NextResponse.json({ error: "Erro interno ao remover post" }, { status: 500 });
  }
}
