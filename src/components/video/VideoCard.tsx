"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { YouTubeVideo } from "@/types";

interface VideoCardProps {
  video: YouTubeVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/video/${video.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="p-0">
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={video.thumbnail.url}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="line-clamp-2 text-base mb-2">
            {video.title}
          </CardTitle>
          <CardDescription className="text-sm mb-2">
            {video.channelTitle}
          </CardDescription>
          <CardDescription className="line-clamp-3 text-xs">
            {video.description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
