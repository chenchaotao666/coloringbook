import { ApiUtils } from '../utils/apiUtils';
import { LocalizedText } from '../utils/textUtils';

export interface Post {
  post_id: string;
  title: LocalizedText;
  slug: string;
  author: string;
  published_date: string;
  status: 'draft' | 'published' | 'archived';
  featured_image: string;
  excerpt: LocalizedText;
  content: LocalizedText;
  meta_title: LocalizedText;
  meta_description: LocalizedText;
  created_at: string;
  updated_at: string;
}

export interface PostsSearchParams {
  postId?: string;
  slug?: string;
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  search?: string;
  sortBy?: 'published_date' | 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
  currentPage?: number;
  pageSize?: number;
  lang?: string;
}

export interface PostsSearchResult {
  posts: Post[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export class PostsService {
  /**
   * 获取博客文章列表
   */
  static async getPosts(params: PostsSearchParams = {}): Promise<PostsSearchResult> {
    const {
      postId,
      slug,
      status,
      author,
      search,
      sortBy = 'published_date',
      sortOrder = 'desc',
      currentPage = 1,
      pageSize = 10,
      lang = 'zh'
    } = params;

    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();
      
      if (postId) searchParams.append('postId', postId);
      if (slug) searchParams.append('slug', slug);
      if (status) searchParams.append('status', status);
      if (author) searchParams.append('author', author);
      if (search) searchParams.append('search', search);
      if (sortBy) searchParams.append('sortBy', sortBy);
      if (sortOrder) searchParams.append('sortOrder', sortOrder);
      if (lang) searchParams.append('lang', lang);
      
      searchParams.append('currentPage', currentPage.toString());
      searchParams.append('pageSize', pageSize.toString());

      const response = await ApiUtils.get<PostsSearchResult>(`/api/blog/posts?${searchParams.toString()}`);
      
      return {
        posts: response.posts || [],
        total: response.total || 0,
        currentPage: response.currentPage || currentPage,
        pageSize: response.pageSize || pageSize
      };
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return {
        posts: [],
        total: 0,
        currentPage: 1,
        pageSize: 10
      };
    }
  }

  /**
   * 根据ID获取单篇文章
   */
  static async getPostById(postId: string): Promise<Post | null> {
    try {
      const result = await this.getPosts({ postId });
      return result.posts.length > 0 ? result.posts[0] : null;
    } catch (error) {
      console.error(`Failed to fetch post ${postId}:`, error);
      return null;
    }
  }

  /**
   * 根据slug获取单篇文章
   */
  static async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const result = await this.getPosts({ slug });
      return result.posts.length > 0 ? result.posts[0] : null;
    } catch (error) {
      console.error(`Failed to fetch post by slug ${slug}:`, error);
      return null;
    }
  }

  /**
   * 获取已发布的文章
   */
  static async getPublishedPosts(params: Omit<PostsSearchParams, 'status'> = {}): Promise<PostsSearchResult> {
    return this.getPosts({ ...params, status: 'published' });
  }

  /**
   * 根据作者获取文章
   */
  static async getPostsByAuthor(
    author: string, 
    params: Omit<PostsSearchParams, 'author'> = {}
  ): Promise<PostsSearchResult> {
    return this.getPosts({ ...params, author });
  }

  /**
   * 搜索文章
   */
  static async searchPosts(
    search: string, 
    params: Omit<PostsSearchParams, 'search'> = {}
  ): Promise<PostsSearchResult> {
    return this.getPosts({ ...params, search });
  }
}

export const postsService = new PostsService();