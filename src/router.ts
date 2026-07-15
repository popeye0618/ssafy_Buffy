import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ExploreView from './views/ExploreView.vue'
import DetailView from './views/DetailView.vue'
import BoardsView from './views/BoardsView.vue'
import PostsView from './views/PostsView.vue'
import PostDetailView from './views/PostDetailView.vue'
import PostEditorView from './views/PostEditorView.vue'
import SearchView from './views/SearchView.vue'
import InfoView from './views/InfoView.vue'
import NotFoundView from './views/NotFoundView.vue'

const router = createRouter({
  history:createWebHistory(),
  scrollBehavior:()=>({top:0}),
  routes:[
    { path:'/', component:HomeView },
    { path:'/attractions', component:ExploreView, props:{type:'attraction'} },
    { path:'/attractions/:id', component:DetailView, props:(route)=>({type:'attraction',id:route.params.id}) },
    { path:'/festivals', component:ExploreView, props:{type:'festival'} },
    { path:'/festivals/:id', component:DetailView, props:(route)=>({type:'festival',id:route.params.id}) },
    { path:'/boards', component:BoardsView },
    { path:'/boards/:boardId/posts', component:PostsView },
    { path:'/boards/:boardId/posts/new', component:PostEditorView },
    { path:'/boards/:boardId/posts/:postId', component:PostDetailView },
    { path:'/boards/:boardId/posts/:postId/edit', component:PostEditorView },
    { path:'/search', component:SearchView },
    { path:'/about', component:InfoView, props:{section:'about'} },
    { path:'/guide', component:InfoView, props:{section:'guide'} },
    { path:'/data-sources', component:InfoView, props:{section:'sources'} },
    { path:'/:pathMatch(.*)*', component:NotFoundView },
  ],
})
router.afterEach(()=>document.querySelector<HTMLElement>('#main-content')?.focus())
export default router
