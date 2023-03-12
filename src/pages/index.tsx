import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useState } from "react";

import { api } from "~/utils/api";

const VIDEOID = "dQw4w9WgXcQ";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  const [player, setPlayer] = useState<YouTubePlayer>();
  const [content, setContent] = useState("");

  const comments = api.comment.getAllComments.useQuery({ videoId: VIDEOID });

  const { mutate } = api.comment.create.useMutation({
    async onSuccess() {
      setContent("");
      comments.refetch();
    },
  });

  return (
    <>
      <Head>
        <title>timed comments on youtube</title>
        <meta name="description" content="timed comments on youtube" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="items-center justify-center">
        <div className="grid grid-cols-2 gap-1">
          <div>
            <YouTube
              iframeClassName={"aspect-video w-full h-full"}
              videoId={VIDEOID}
              onReady={(event) => setPlayer(event.target)}
            />
          </div>
          <div>
            <AuthShowcase />
            {sessionData && (
              <div>
                <div className="flex flex-col">
                  <textarea
                    className="rounded-lg border border-gray-500 p-2"
                    placeholder="Write your comment here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <button
                  className="rounded-full bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-800"
                  onClick={() => {
                    mutate({
                      userId: sessionData.user.id,
                      videoId: VIDEOID,
                      timestamp: Math.floor(player.getCurrentTime()),
                      content: content,
                    });
                  }}
                >
                  Comment
                </button>
              </div>
            )}
            {comments.data ? (
              <div className="w-full max-w-2xl">
                {comments.data?.length === 0 ? (
                  <span>There are no comments!</span>
                ) : (
                  <div className="flex justify-center px-4">
                    <div className="flex w-full flex-col gap-4">
                      {comments.data?.map((c) => {
                        return (
                          <p>
                            {c.user.name} @{Math.floor(c.timestamp / 60)}m
                            {Math.floor(c.timestamp % 60)}s: {c.content}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex-col-2 flex items-center">
      <button
        className="rounded-full bg-red-600 px-10 py-3 font-semibold text-white transition hover:bg-red-800"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
