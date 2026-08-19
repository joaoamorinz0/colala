-- Profile images currently share the public "avatars" bucket.
-- Covers are larger than typical avatars, so allow up to 10 MB.
update storage.buckets
set file_size_limit = 10485760
where id = 'avatars';
