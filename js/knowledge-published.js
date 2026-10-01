(() => {
  if (typeof supabaseClient === 'undefined') return;
  supabaseClient.from('posts').select('id,title,category,image_url,excerpt,content,created_at').eq('is_published',true).order('created_at',{ascending:false}).then(({data,error}) => {
    if (!error && data?.length) window.setPublishedBlogPosts(data);
  }).catch(() => { /* The local reading library remains available offline. */ });
})();
