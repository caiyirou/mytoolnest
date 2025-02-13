import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/db';
import Category from '@/app/models/category';

// 删除分类
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 检查分类是否存在且属于当前用户
    const category = await Category.findOne({
      _id: params.id,
      creator: user._id
    });

    if (!category) {
      return NextResponse.json(
        { message: '分类不存在或无权限删除' },
        { status: 404 }
      );
    }

    // 将该分类下的所有工具移到"无分类"
    await mongoose.model('Tool').updateMany(
      { category: category._id },
      { $set: { category: null } }
    );

    // 删除分类
    await Category.deleteOne({ _id: params.id });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json(
      { message: '删除分类失败' },
      { status: 500 }
    );
  }
}

// 更新分类
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { name } = await request.json();

    // 验证名称
    if (!name?.trim()) {
      return NextResponse.json(
        { message: '分类名称不能为空' },
        { status: 400 }
      );
    }

    // 查找并更新分类
    const category = await Category.findOneAndUpdate(
      { _id: params.id, creator: user._id },
      { name: name.trim() },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { message: '分类不存在或无权限修改' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json(
      { message: '更新分类失败' },
      { status: 500 }
    );
  }
}