import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/convertDurantion";
import Image from "next/image";

import styles from "./episode.module.scss";

type Episode = {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  description: string;
  durationAsString: string;
  publishedAt: string;
  url: string;
  published_at: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  const router = useRouter();

  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>
        <button type="button">
          <img src="/arrow-left.svg" alt="Back" />
        </button>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button">
          <img src="/play.svg" alt="Play Episode" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

export const getStaticPath: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;
  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: { episode },
    revalidate: 60 * 60 * 24, //24 hours
  };
};
