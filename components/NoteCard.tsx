import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Note, User } from '@/types';
import colors from '@/constants/colors';

interface NoteCardProps {
  note: Note;
  user: User | undefined;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export default function NoteCard({ note, user }: NoteCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.userName}>{user?.name || 'Unknown'}</Text>
          <Text style={styles.date}>{formatDate(note.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.text}>{note.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  text: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
