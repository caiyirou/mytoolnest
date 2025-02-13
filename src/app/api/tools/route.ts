import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/db';
import Tool from '@/app/models/tool';
import Category from '@/app/models/category';

// 获取工具列表
export async function GET(request: Request) {
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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // 构建查询条件
    const query: any = { creator: user._id };
    
    if (category === 'uncategorized') {
      query.category = null;
    } else if (category && category !== 'all') {
      query.category = category;
    }

    // 获取工具列表
    const tools = await Tool.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(tools);
  } catch (error) {
    console.error('获取工具列表失败:', error);
    return NextResponse.json(
      { message: '获取工具列表失败' },
      { status: 500 }
    );
  }
}

// 创建工具
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

    await connectDB();

    // 获取用户ID
    const user = await mongoose.model('User').findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    const { title, description, url, category } = await request.json();

    // 验证必填字段
    if (!title?.trim()) {
      return NextResponse.json(
        { message: '标题是必需的' },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { message: '描述是必需的' },
        { status: 400 }
      );
    }

    if (!url?.trim()) {
      return NextResponse.json(
        { message: 'URL是必需的' },
        { status: 400 }
      );
    }

    // 创建工具数据对象
    const toolData = {
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      creator: user._id,
      category: null // 默认为 null
    };

    // 如果选择了分类且不是"无分类"，则验证分类并设置
    if (category && category !== '' && category !== 'uncategorized') {
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
      toolData.category = category;
    }

    // 创建工具
    const tool = await Tool.create(toolData);

    // 返回创建的工具（包含分类信息）
    const populatedTool = await Tool.findById(tool._id)
      .populate('category', 'name');

    return NextResponse.json(populatedTool);
  } catch (error) {
    console.error('创建工具失败:', error);
    return NextResponse.json(
      { message: '创建工具失败' },
      { status: 500 }
    );
  }
}