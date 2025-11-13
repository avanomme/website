website-blob
All Databases

Blob Store

Region

IAD1
Created

Just now

Storage

0 B

Storage (average)

0 B/1 GB

Simple Operations

0/10k

Advanced Operations

0/2k

Data Transfer

0 B/10 GB

Quickstart





BLOB_READ_WRITE_TOKEN="vercel_blob_rw_1hMdOc4cfRZddig0_EwVduliU8vdVjXsKvwGehRvuz0Q16s"
Browser
Getting Started
Projects
Settings
RESOURCES

Documentation
@vercel/blob
Browser
View and manage the blobs in this store.

Search Blobs by prefix, name or URL
Search the name of a blob, a prefix or a fully qualified URL
website-blob



All Databases

Blob Store

Region

IAD1
Created

1m ago

Storage

0 B

Storage (average)

0 B/1 GB

Simple Operations

0/10k

Advanced Operations

0/2k

Data Transfer

0 B/10 GB

Quickstart





BLOB_READ_WRITE_TOKEN="vercel_blob_rw_1hMdOc4cfRZddig0_EwVduliU8vdVjXsKvwGehRvuz0Q16s"
Browser
Getting Started
Projects
Settings
RESOURCES

Documentation
@vercel/blob
Settings
Edit the settings for this store.

Store Name
website-blob
Please use 32 characters at maximum.

Store Information
Unique Store ID

store_1hMdOc4cfRZddig0
Storage Region

Washington, D.C., USA

IAD1
This is the Base URL for all blobs in this store.

https://1hmdoc4cfrzddig0.public.blob.vercel-storage.com


Quickstart




import { put } from "@vercel/blob";

const { url } = await put('articles/blob.txt', 'Hello World!', { access: 'public' });