# Adding Animated Content to the Landing Page

This guide explains how to create and add animated content (GIFs/screen recordings) to enhance the landing page.

## GIF Locations and Formats

All GIF files should be placed in the `/public/videos/` directory. The landing page is currently set up to use the following GIF files:

- `/public/videos/dashbaord.gif` - Main hero section animation (click-to-play)
- `/public/videos/real-time-tracking.gif` - "See It In Action" section (left)
- `/public/videos/analytics-dashboard.gif` - "See It In Action" section (right)

## Recommended GIF Specifications

For optimal performance and quality:

- **Format**: GIF (widely supported across all browsers)
- **Resolution**: 600x400 or similar aspect ratio
- **Framerate**: 15-20fps (balance between smoothness and file size)
- **Duration**: 3-5 seconds per animation (looping)
- **Colors**: Limit color palette to reduce file size
- **File Size**: Aim for under 1-2MB per GIF for optimal page load times

## Creating and Optimizing GIFs

### Recording Screen Captures

1. **On macOS**:

   - Use QuickTime Player to record your screen
   - Go to File > New Screen Recording
   - Record the feature you want to showcase
   - Keep movements smooth and focused

2. **On Windows**:

   - Use Xbox Game Bar (Win + G) or OBS Studio
   - Record short, focused demonstrations
   - Aim for clear, deliberate actions

3. **On Linux**:
   - Use SimpleScreenRecorder or OBS Studio
   - Focus on key features and workflows

### Converting to GIF

#### Using Online Tools (Recommended for Simplicity)

Several online tools make it easy to convert videos to optimized GIFs:

- [Ezgif](https://ezgif.com/video-to-gif) - Upload video, crop, optimize
- [Giphy](https://giphy.com/create/gifmaker) - Good for simple conversions
- [Convertio](https://convertio.co/mp4-gif/) - Supports many input formats

#### Using FFmpeg (For Advanced Users)

For more control over the output quality:

```bash
# Install FFmpeg
# On macOS: brew install ffmpeg
# On Ubuntu/Debian: sudo apt install ffmpeg
# On Windows: download from https://ffmpeg.org/download.html

# Convert video to GIF with good quality/size balance
ffmpeg -i input.mp4 -vf "fps=15,scale=600:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif
```

### Optimizing GIFs

To reduce file size while maintaining quality:

- [Ezgif Optimizer](https://ezgif.com/optimize) - Easy online tool
- [ImageOptim](https://imageoptim.com/) - Desktop app for macOS
- [FileOptimizer](https://nikkhokkho.sourceforge.io/static.php?page=FileOptimizer) - Windows app

## Tips for Creating Effective UI Animations

1. **Focus on Key Features**: Highlight the most important aspects of your application.
2. **Keep it Short**: 3-5 seconds is ideal for looping GIFs.
3. **Show Real Usage**: Demonstrate actual user flows rather than static screens.
4. **Maintain Consistency**: Use similar styling, speed, and transitions across all GIFs.
5. **Add Visual Cues**: Consider adding cursor movements or highlights to guide viewer attention.
6. **Limit Motion**: Too much movement can be distracting and increase file size.
7. **Test Performance**: Ensure GIFs don't slow down your page load times.

## VideoPlayer Component Features

The VideoPlayer component supports several features to enhance the presentation of animated content:

### Basic Usage

```jsx
<VideoPlayer
  gifSrc="/videos/example.gif"
  posterSrc="/fallback-image.png"
  className="..."
  caption="Caption text here"
/>
```

### Enhanced Features

- **Click-to-Play**: Requires user interaction to start the animation

  ```jsx
  <VideoPlayer
    gifSrc="/videos/example.gif"
    posterSrc="/fallback-image.png"
    clickToPlay={true}
  />
  ```

- **Rounded Corners**: Various border radius options

  ```jsx
  <VideoPlayer
    gifSrc="/videos/example.gif"
    rounded="xl" // Options: sm, md, lg, xl, 2xl, 3xl, full
  />
  ```

- **Contrast Overlay**: Slightly darkens the content for better visibility in both light and dark modes

  ```jsx
  <VideoPlayer gifSrc="/videos/example.gif" overlay={true} />
  ```

- **Object Fit**: Controls how the content fits within its container

  ```jsx
  <VideoPlayer
    gifSrc="/videos/example.gif"
    objectFit="contain" // Options: cover, contain, fill, none, scale-down
  />
  ```

  - `cover` (default): Fills the container, may crop content
  - `contain`: Shows the entire content with letterboxing if needed
  - `fill`: Stretches to fill container (may distort)
  - `none`: No resizing
  - `scale-down`: Uses either `none` or `contain`, whichever results in a smaller size

- **Auto Size**: Automatically sizes the container to match the content's natural aspect ratio
  ```jsx
  <VideoPlayer gifSrc="/videos/example.gif" autoSize={true} />
  ```
  - When `true`, the component will attempt to maintain the natural aspect ratio of the video
  - For videos, this uses the video's metadata to calculate the correct dimensions
  - For GIFs, this works best when combined with `objectFit="contain"`
  - Prevents aspect ratio distortion without requiring manual sizing

### Alternative Formats

While the landing page currently uses GIFs, the VideoPlayer component also supports WebM and MP4 videos. If you need higher quality animations in the future, you can switch to these formats:

```jsx
<VideoPlayer
  webmSrc="/videos/example.webm"
  mp4Src="/videos/example.mp4"
  posterSrc="/fallback-image.png"
  clickToPlay={true}
  rounded="xl"
  overlay={true}
  objectFit="contain"
  autoSize={true}
/>
```

This flexibility allows you to choose the best format based on your specific needs and quality requirements.
