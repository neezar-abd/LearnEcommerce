'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotifications(profileId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    
    const unreadCount = await prisma.notification.count({
      where: { profileId, isRead: false },
    });

    return { notifications, unreadCount };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
}

export async function markAllAsRead(profileId: string) {
  try {
    await prisma.notification.updateMany({
      where: { profileId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { success: false };
  }
}
