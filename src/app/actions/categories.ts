'use server';

import connectDB from '@/app/lib/db';
import Category from '@/app/models/category';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function getCategories() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    await connectDB();
    const user = await mongoose.model('User').findOne({ email: session.user.email });
    if (!user) return [];

    return await Category.find({ creator: user._id }).sort({ name: 1 });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return [];
  }
}