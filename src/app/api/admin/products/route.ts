import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET all products
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error("GET_PRODUCTS_ERROR", error);
        return NextResponse.json({ error: "Ürünler getirilirken hata oluştu." }, { status: 500 });
    }
}

// CREATE a new product
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const body = await req.json();
        const { name, slug, description, category, price, iconType, isActive } = body;

        if (!name || !slug || !category || price === undefined) {
            return NextResponse.json({ error: "Temel alanlar zorunludur (Ad, Slug, Kategori, Fiyat)." }, { status: 400 });
        }

        const existingSlug = await prisma.product.findUnique({ where: { slug } });
        if (existingSlug) {
            return NextResponse.json({ error: "Bu slug (URL kısaltması) zaten kullanımda." }, { status: 400 });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                category,
                price: parseFloat(price.toString()),
                iconType: iconType || "blocks",
                isActive: isActive ?? true
            }
        });

        return NextResponse.json({ message: "Ürün başarıyla eklendi.", product: newProduct }, { status: 201 });
    } catch (error) {
        console.error("CREATE_PRODUCT_ERROR", error);
        return NextResponse.json({ error: "Ürün oluşturulurken hata oluştu." }, { status: 500 });
    }
}

// UPDATE an existing product
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const body = await req.json();
        const { id, name, slug, description, category, price, iconType, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: "Ürün ID'si zorunludur." }, { status: 400 });
        }

        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existingProduct.name,
                slug: slug !== undefined ? slug : existingProduct.slug,
                description: description !== undefined ? description : existingProduct.description,
                category: category !== undefined ? category : existingProduct.category,
                price: price !== undefined ? parseFloat(price.toString()) : existingProduct.price,
                iconType: iconType !== undefined ? iconType : existingProduct.iconType,
                isActive: isActive !== undefined ? isActive : existingProduct.isActive
            }
        });

        return NextResponse.json({ message: "Ürün başarıyla güncellendi.", product: updatedProduct });
    } catch (error) {
        console.error("UPDATE_PRODUCT_ERROR", error);
        return NextResponse.json({ error: "Ürün güncellenirken hata oluştu." }, { status: 500 });
    }
}

// DELETE a product
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Ürün ID'si zorunludur." }, { status: 400 });
        }

        // Check if there are active subscriptions before deleting
        const activeSubscriptions = await prisma.subscription.count({
            where: { productId: id, status: { in: ["active", "pending_approval"] } }
        });

        if (activeSubscriptions > 0) {
            return NextResponse.json({ error: `Bu ürüne ait ${activeSubscriptions} aktif abonelik var. Ürünü silemezsiniz, pasife çekebilirsiniz.` }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Ürün başarıyla silindi." });
    } catch (error) {
        console.error("DELETE_PRODUCT_ERROR", error);
        return NextResponse.json({ error: "Ürün silinirken hata oluştu." }, { status: 500 });
    }
}
