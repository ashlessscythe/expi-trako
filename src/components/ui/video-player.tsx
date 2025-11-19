import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  webmSrc?: string;
  mp4Src?: string;
  gifSrc?: string;
  posterSrc?: string;
  caption?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  clickToPlay?: boolean;
  className?: string;
  aspectRatio?: "square" | "video" | "vertical";
  overlay?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full" | boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  autoSize?: boolean;
}

const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    {
      webmSrc,
      mp4Src,
      gifSrc,
      posterSrc,
      caption,
      autoPlay = true,
      loop = true,
      muted = true,
      controls = false,
      clickToPlay = false,
      className,
      aspectRatio = "video",
      overlay = false,
      rounded = "lg",
      objectFit = "contain",
      autoSize = false,
      ...props
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = React.useState(autoPlay && !clickToPlay);
    const [dimensions, setDimensions] = React.useState<{
      width: number;
      height: number;
    } | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const imageRef = React.useRef<HTMLDivElement>(null);

    const aspectRatioClasses = {
      square: "aspect-square",
      video: "aspect-video",
      vertical: "aspect-[9/16]",
    };

    const roundedClasses = {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
      full: "rounded-full",
      true: "rounded-lg",
      false: "",
    };

    const handlePlayClick = () => {
      if (gifSrc) {
        setIsPlaying(true);
        return;
      }

      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    React.useEffect(() => {
      // Handle autoplay if not clickToPlay
      if (autoPlay && !clickToPlay && videoRef.current) {
        videoRef.current.play().catch(() => {
          // Autoplay was prevented
          setIsPlaying(false);
        });
      }
    }, [autoPlay, clickToPlay]);

    const roundedClass =
      typeof rounded === "string"
        ? roundedClasses[rounded as keyof typeof roundedClasses]
        : roundedClasses[String(rounded) as keyof typeof roundedClasses];

    // Handle video metadata loaded to get natural dimensions
    React.useEffect(() => {
      if (autoSize && videoRef.current) {
        const videoElement = videoRef.current;
        const handleMetadataLoaded = () => {
          setDimensions({
            width: videoElement.videoWidth,
            height: videoElement.videoHeight,
          });
        };

        videoElement.addEventListener("loadedmetadata", handleMetadataLoaded);

        // If video is already loaded, get dimensions immediately
        if (videoElement.readyState >= 1) {
          handleMetadataLoaded();
        }

        return () => {
          videoElement.removeEventListener(
            "loadedmetadata",
            handleMetadataLoaded
          );
        };
      }
    }, [autoSize]);

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", roundedClass, className)}
        {...props}
      >
        <div
          className={cn(
            "w-full",
            // If not autoSize, use the predefined aspect ratio
            !autoSize && aspectRatioClasses[aspectRatio],
            // If autoSize but no dimensions yet, use a default aspect ratio
            autoSize && !dimensions && aspectRatioClasses["video"]
          )}
          style={
            // Only apply calculated aspect ratio if we have dimensions
            autoSize && dimensions
              ? {
                  position: "relative",
                  paddingBottom: `${(dimensions.height / dimensions.width) * 100}%`,
                }
              : undefined
          }
        >
          {gifSrc ? (
            // If GIF source is provided, use an image element
            <div
              ref={imageRef}
              className={cn(
                "w-full h-full relative",
                clickToPlay && !isPlaying && "cursor-pointer"
              )}
              onClick={clickToPlay ? handlePlayClick : undefined}
            >
              <Image
                src={gifSrc}
                alt={caption || "Animated content"}
                fill
                unoptimized
                className={cn(
                  objectFit === "contain"
                    ? "object-contain"
                    : objectFit === "cover"
                      ? "object-cover"
                      : objectFit === "fill"
                        ? "object-fill"
                        : objectFit === "none"
                          ? "object-none"
                          : objectFit === "scale-down"
                            ? "object-scale-down"
                            : "object-contain",
                  overlay && "brightness-[0.85] contrast-[1.1]"
                )}
                priority
                style={{
                  display: clickToPlay && !isPlaying ? "none" : "block",
                }}
              />
              {clickToPlay && !isPlaying && posterSrc && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={posterSrc}
                    alt="Video thumbnail"
                    fill
                    className={cn(
                      objectFit === "contain"
                        ? "object-contain"
                        : objectFit === "cover"
                          ? "object-cover"
                          : objectFit === "fill"
                            ? "object-fill"
                            : objectFit === "none"
                              ? "object-none"
                              : objectFit === "scale-down"
                                ? "object-scale-down"
                                : "object-contain",
                      overlay && "brightness-[0.85] contrast-[1.1]"
                    )}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-8 h-8 text-primary ml-1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Otherwise use video element with WebM/MP4 sources
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                className={cn(
                  "w-full h-full",
                  objectFit === "contain"
                    ? "object-contain"
                    : objectFit === "cover"
                      ? "object-cover"
                      : objectFit === "fill"
                        ? "object-fill"
                        : objectFit === "none"
                          ? "object-none"
                          : objectFit === "scale-down"
                            ? "object-scale-down"
                            : "object-contain",
                  overlay && "brightness-[0.85] contrast-[1.1]"
                )}
                autoPlay={autoPlay && !clickToPlay}
                loop={loop}
                muted={muted}
                controls={controls}
                playsInline
                poster={posterSrc}
              >
                {webmSrc && <source src={webmSrc} type="video/webm" />}
                {mp4Src && <source src={mp4Src} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>

              {clickToPlay && !isPlaying && (
                <div
                  className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                  onClick={handlePlayClick}
                >
                  <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 text-primary ml-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {caption && (
          <div className="mt-2 text-sm text-muted-foreground text-center">
            {caption}
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer };
