Skip to content
madmanvo
madmanvo

Hobby

website


Find…
F


software-features
All Databases

Installation

Redis

Status

Available

Created

1m ago

Plan

Redis/30 MB

Current Period

-

Period Total

-

Quickstart








redis-cli -u redis://default:2Ecfer5qZnAkgw90U5ZF0hROxQ1R1gB8@redis-17646.c274.us-east-1-3.ec2.cloud.redislabs.com:17646
Projects
Settings
Getting Started
Usage
RESOURCES

Documentation
Vector search with Redis
Support

Framework logo
Next.js
1

Connect to a project

Start by connecting to your existing project and then run vercel link in the CLI to link to the project locally.

2

Pull your latest environment variables

Run vercel env pull .env.development.local to make the latest environment variables available to your project locally.

3

Install node-redis


npm install redis
4

Import and Initialize the SDK


import { createClient } from 'redis';
import { NextResponse } from 'next/server';

const redis = await createClient().connect();

export const POST = async () => {
  // Fetch data from Redis
  const result = await redis.get("item");
  
  // Return the result in the response
  return new NextResponse(JSON.stringify({ result }), { status: 200 });
};
Home
Docs
Guides
Academy
Help
Contact
Loading status…

Select a display theme:

system

light

dark
..................
Web Analytics
Collect insights on user behavior and site performance with page view metrics