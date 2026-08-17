create table if not exists public.blog_posts (
  id bigserial primary key,
  title text not null,
  slug text not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text,
  tags text[] not null default '{}'::text[],
  author_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  seo_title text,
  seo_description text,
  og_image text,
  constraint blog_posts_title_not_blank check (length(btrim(title)) > 0),
  constraint blog_posts_slug_not_blank check (length(btrim(slug)) > 0),
  constraint blog_posts_content_not_blank check (length(btrim(content)) > 0),
  constraint blog_posts_status_check check (status in ('draft', 'published')),
  constraint blog_posts_published_at_required check (status <> 'published' or published_at is not null)
);

create unique index if not exists blog_posts_slug_unique
  on public.blog_posts (lower(btrim(slug)));

create index if not exists blog_posts_published_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_category_idx
  on public.blog_posts (category);

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;

create trigger set_blog_posts_updated_at
  before update on public.blog_posts
  for each row
  execute function public.set_blog_posts_updated_at();

alter table public.blog_posts enable row level security;

create policy "public can read published blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );

create policy "admins can manage blog posts"
  on public.blog_posts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.blog_posts from anon, authenticated;

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant usage, select on sequence public.blog_posts_id_seq to authenticated;
