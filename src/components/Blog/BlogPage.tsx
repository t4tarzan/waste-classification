import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  InputBase,
  IconButton,
  Paper,
  Button,
  Pagination,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { blogPosts } from './blogData';
import { BlogPost } from '../../types';

const allTags = Array.from(new Set(blogPosts.flatMap((post) => post.tags))).sort();

export const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const postsPerPage = 6;
  const navigate = useNavigate();

  const filteredPosts = blogPosts.filter((post: BlogPost) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => post.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
  };

  const paginatedPosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" gutterBottom>
            Waste Management Blog
          </Typography>
          <Typography variant="h5">
            Stay informed about the latest trends and insights in waste management
          </Typography>
        </Container>
      </Box>

      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper
              component="form"
              onSubmit={handleSearch}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IconButton type="submit" sx={{ p: '10px' }}>
                <SearchIcon />
              </IconButton>
            </Paper>

            <Grid container spacing={4}>
              {paginatedPosts.map((post) => (
                <Grid item xs={12} key={post.id}>
                  <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <CardMedia
                      component="img"
                      sx={{
                        width: { xs: '100%', sm: 200 },
                        height: { xs: 200, sm: 'auto' },
                        objectFit: 'cover',
                      }}
                      image={post.imageUrl}
                      alt={post.title}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {post.title}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {post.date} • {post.readTime} • By {post.author.name}
                        </Typography>
                      </Box>
                      <Typography variant="body1" paragraph>
                        {post.excerpt}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          {post.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() => handleTagClick(tag)}
                              color={selectedTags.includes(tag) ? 'primary' : 'default'}
                            />
                          ))}
                        </Box>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate(`/blog/${post.id}`)}
                        >
                          Read More
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(filteredPosts.length / postsPerPage)}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Topics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagClick(tag)}
                    color={selectedTags.includes(tag) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Newsletter
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Subscribe to our newsletter for the latest updates in waste management.
              </Typography>
              <Button variant="contained" fullWidth>
                Subscribe
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
