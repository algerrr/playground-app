import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";

import { environment } from "../../environments/environment";
import { Post } from "./post.model";

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number, tagsList: string[] }>();
  private newBackendUrl = '';

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Get all posts from the database and return them as an array of posts
   * @param {number} postPerPage - number, currentPage: number
   * @param {number} currentPage - number
   */
  getPosts(postPerPage: number, currentPage: number, tags: string) {
    let queryParams = '';
    if (tags) {
      this.newBackendUrl = BACKEND_URL + 'list/';
      queryParams = `?pagesize=${postPerPage}&page=${currentPage}&tags=${tags}`;
    } else {
      this.newBackendUrl = BACKEND_URL;
      queryParams = `?pagesize=${postPerPage}&page=${currentPage}`;
    }
    console.log(this.newBackendUrl + queryParams);
    this.http
      .get<{ message: string, posts: any, maxPosts: number, tags: string }>(
        this.newBackendUrl + queryParams
      )
      .pipe(
        map(postData => {
          // console.log("IN MAP");
          // console.log(typeof(postData));
          // console.log(postData);
          return {
            posts: postData.posts.map((post: { title: any; content: any; _id: any; imagePath: any; creator: any; tags: any; }) => {
              // console.log("IN MAP");
              // console.log(post);
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
                tags: post.tags.split(',')
              };
            }),
            maxPosts: postData.maxPosts,
            tags: postData.tags.split(',')
          }
        }))
      .subscribe((transformedPostData) => {
        this.newBackendUrl = '';
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts,
          tagsList: transformedPostData.tags
        });
      });
  }

  getPostUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  /**
   * It returns a promise of an object containing the post with the given id.
   * @param {string} id - string
   * @returns An object with the post's title, content, imagePath, creator, and tags.
   */
  getPostById(id: string) {
    return this.http
      .get<{
        _id: string,
        title: string,
        content: string,
        imagePath: string,
        creator: string,
        tags: string
      }>(BACKEND_URL + id);
  }

  getPostByTags(tags: string) {
    return this.http
      .get<{
        _id: string,
        title: string,
        content: string,
        imagePath: string,
        creator: string,
        tags: string
      }>(BACKEND_URL + tags.toString());
  }

  addPosts(title: string, content: string, image: File, tags: string): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    postData.append('tags', tags);
    this.http
      .post<{ message: string, post: Post }>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string, tags: string) {
    let postData: Post | FormData;
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
      postData.append('tags', tags);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null,
        tags: tags
      };
    }

    this.http
      .put(BACKEND_URL + id, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  deletePosts(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
