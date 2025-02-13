import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/db';
import Tool from '@/models/tool';
import Category from '@/models/category';

// 获取单个工具
export async function GET(
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

    // 获取工具信息
    const tool = await Tool.findOne({
      _id: params.id,
      creator: user._id
    }).populate('category', 'name');

    if (!tool) {
      return NextResponse.json(
        { message: '工具不存在或无权限访问' },
        { status: 404 }
      );
    }

    return NextResponse.json(tool);
  } catch (error) {
    console.error('获取工具失败:', error);
    return NextResponse.json(
      { message: '获取工具失败' },
      { status: 500 }
    );
  }
}

// 更新工具
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

    const { title, description, url, category } = await request.json();

    // 验证必填字段
    if (!title || !description || !url) {
      return NextResponse.json(
        { message: '标题、描述和URL都是必需的' },
        { status: 400 }
      );
    }

    // 验证字段长度
    if (title.length > 100) {
      return NextResponse.json(
        { message: '标题不能超过100个字符' },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        { message: '描述不能超过500个字符' },
        { status: 400 }
      );
    }

    if (url.length > 2000) {
      return NextResponse.json(
        { message: 'URL不能超过2000个字符' },
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

    // 检查工具是否存在且属于当前用户
    const existingTool = await Tool.findOne({
      _id: params.id,
      creator: user._id
    });

    if (!existingTool) {
      return NextResponse.json(
        { message: '工具不存在或无权限修改' },
        { status: 404 }
      );
    }

    // 如果指定了分类，验证分类是否存在且属于当前用户
    if (category) {
      const validCategory = await Category.findOne({
        _id: category,
        creator: user._id
      });

      if (!validCategory) {
        return NextResponse.json(
          { message: '分类不存在或无权限使用' },
          { status: 404 }
        );
      }
    }

    // 更新工具
    const updatedTool = await Tool.findByIdAndUpdate(
      params.id,
      {
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        category: category || null
      },
      { new: true }
    ).populate('category', 'name');

    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error('更新工具失败:', error);
    return NextResponse.json(
      { message: '更新工具失败' },
      { status: 500 }
    );
  }
}

// 删除工具
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

    // 检查工具是否存在且属于当前用户
    const tool = await Tool.findOne({
      _id: params.id,
      creator: user._id
    });

    if (!tool) {
      return NextResponse.json(
        { message: '工具不存在或无权限删除' },
        { status: 404 }
      );
    }

    // 删除工具
    await Tool.deleteOne({ _id: params.id });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除工具失败:', error);
    return NextResponse.json(
      { message: '删除工具失败' },
      { status: 500 }
    );
  }
}