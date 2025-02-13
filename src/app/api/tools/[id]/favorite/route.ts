import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/db';
import Tool from '@/models/tool';

// 收藏/取消收藏工具
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    await connectDB();
    const tool = await Tool.findById(params.id);

    if (!tool) {
      return NextResponse.json(
        { message: '工具不存在' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const isFavorited = tool.favorites.includes(userId);

    if (isFavorited) {
      // 取消收藏
      tool.favorites = tool.favorites.filter(
        (id: any) => id.toString() !== userId
      );
      tool.favoritesCount = Math.max(0, tool.favoritesCount - 1);
    } else {
      // 添加收藏
      tool.favorites.push(userId);
      tool.favoritesCount += 1;
    }

    await tool.save();

    return NextResponse.json({
      isFavorited: !isFavorited,
      favoritesCount: tool.favoritesCount
    });
  } catch (error) {
    return NextResponse.json(
      { message: '操作失败' },
      { status: 500 }
    );
  }
}

// 获取收藏状态
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    await connectDB();
    const tool = await Tool.findById(params.id);

    if (!tool) {
      return NextResponse.json(
        { message: '工具不存在' },
        { status: 404 }
      );
    }

    const isFavorited = tool.favorites.includes(session.user.id);

    return NextResponse.json({
      isFavorited,
      favoritesCount: tool.favoritesCount
    });
  } catch (error) {
    return NextResponse.json(
      { message: '获取状态失败' },
      { status: 500 }
    );
  }
}