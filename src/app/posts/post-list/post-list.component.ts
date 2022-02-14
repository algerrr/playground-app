import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ifStmt } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  tagsList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  isLoading = false;
  totalPosts: number = 0;
  postPerPage: number = 5;
  currentPage: number = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated: boolean = false;
  userId: string;
  step = 0;
  mode: string;
  searchTags: string


  private postsSub!: Subscription;
  private authStatusSub!: Subscription;

  constructor(public postsService: PostsService, private authService: AuthService, public route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      // console.log(params.has('tag'));
      this.isLoading = true;
      if (params.has('tag')) {
        this.mode = 'tag';
        this.searchTags = params.get('tag') as string;
        console.log("IN Init");
        console.log(this.searchTags);
        this.postsService.getPosts(this.postPerPage, this.currentPage, this.searchTags);
      } else {
        this.mode = 'list';
        this.postsService.getPosts(this.postPerPage, this.currentPage, '');
      }
      console.log(this.mode);
      this.userId = this.authService.getUserId();
      this.postsSub = this.postsService
        .getPostUpdatedListener()
        .subscribe((postData: { posts: Post[], postCount: number, tagsList: any }) => {
          this.isLoading = false;
          this.posts = postData.posts;
          this.tagsList = postData.tagsList;
          this.totalPosts = postData.postCount
        });
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authStatusSub = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
          this.userId = this.authService.getUserId();
        });
    });
  }

  onChangedPage(event: PageEvent): void {
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.postPerPage = event.pageSize;
    this.postsService.getPosts(this.postPerPage, this.currentPage, '');
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePosts(postId).subscribe(() => {
      this.postsService.getPosts(this.postPerPage, this.currentPage, '');
    }, error => {
      this.isLoading = false;
    });
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  ngOnDestroy(): void {
    if (this.postsSub) {
      this.postsSub.unsubscribe();
    }
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
  }
}
