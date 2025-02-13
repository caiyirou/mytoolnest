import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/db';
import Category from '@/models/category';

// 获取分类列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { message: '请先登录' },
        { status: 401 }
      );
    }

    await connectDB();

    // 获取用户ID
    const user = await mongoose.model('User').findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取该用户的所有分类
    const categories = await Category.find({ creator: user._id })
      .sort({ createdAt: -1 });

    // 获取每个分类的工具数量
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const toolCount = await mongoose.model('Tool').countDocuments({
          category: category._id
        });
        return {
          _id: category._id,
          name: category.name,
          toolCount,
          creator: category.creator,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        };
      })
    );

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json(
      { message: '获取分类列表失败' },
      { status: 500 }
    );
  }
}

// 创建分类
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { message: '请先登录' },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    // 验证分类名称
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { message: '分类名称不能为空' },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { message: '分类名称不能超过50个字符' },
        { status: 400 }
      );
    }

    await connectDB();

    // 获取用户ID
    const user = await mongoose.model('User').findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({
      creator: user._id,
      name: name.trim()
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: '分类名称已存在' },
        { status: 400 }
      );
    }

    // 创建新分类
    const category = await Category.create({
      name: name.trim(),
      creator: user._id
    });

    // 返回创建的分类（包含工具数量）
    const categoryWithCount = {
      ...category.toObject(),
      toolCount: 0
    };

    return NextResponse.json(categoryWithCount);
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json(
      { message: '创建分类失败' },
      { status: 500 }
    );
  }
}