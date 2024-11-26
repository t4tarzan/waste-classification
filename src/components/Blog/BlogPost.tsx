import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { blogPosts } from './blogData';

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Blog post not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          component="img"
          src={post.imageUrl}
          alt={post.title}
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: '500px',
            objectFit: 'cover',
            borderRadius: 1,
            mb: 3,
          }}
        />
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
            {post.date} • {post.readTime} • By {post.author.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
            <Avatar src={post.author.avatar} alt={post.author.name} sx={{ mr: 2 }} />
            <Typography variant="subtitle2" color="text.secondary">
              {post.author.name}
            </Typography>
          </Box>
          <Box sx={{ mb: 3 }}>
            {post.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                sx={{ mr: 1 }}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Typography variant="subtitle1" sx={{ mb: 4, fontStyle: 'italic' }}>
            {post.excerpt}
          </Typography>
          <Divider sx={{ mb: 4 }} />
          {post.content.split('\n\n').map((paragraph, index) => (
            <Typography key={index} paragraph>
              {paragraph}
            </Typography>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};
