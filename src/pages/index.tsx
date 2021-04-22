import { format, parseISO } from "date-fns";
import Image from "next/image";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { GetStaticProps } from "next";
import { api } from "../services/api";
import { convertDurationToTimeString } from "../utils/convertDurantion";

import styles from "./home.module.scss";

type Episode = {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  publishedAt: string;
  url: string;
  published_at: string;
};

type HomeProps = {
  latestsEpisodes: Episode[];
  allEpisodes: Episode[];
};

export default function Home({ latestsEpisodes, allEpisodes }: HomeProps) {
  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Latests</h2>
        <ul>
          {latestsEpisodes.map((episode) => {
            return (
              <li key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>

                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button">
                  <img src="/play-green.svg" alt="Play Episode" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>All episodes</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>podcast</th>
              <th>integrantes</th>
              <th>data</th>
              <th>duracao</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button type="button">
                      <img src="/play-green.svg" alt="Play" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const episodes = data.map((episode) => {
    return {
      ...episode,
      publishedAt: format(parseISO(episode.published_at), "d MMM yy", {
        locale: ptBR,
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
      url: episode.file.url,
    };
  });

  const latestsEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestsEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  };
};
