'use client';

import { creatorsClient as creatorsApi } from '@/api/client';
import { queryKeys } from '@/api/query-keys';
import { usePrefetch } from '@/lib/hooks/use-prefetch';
import type { Creator } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const { prefetchRoute } = usePrefetch();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(creator.following ?? false);
  const isUserActionRef = useRef(false);
  const lastActionTimeRef = useRef<number>(0);
  const lastConfirmedValueRef = useRef<boolean | null>(creator.following ?? null);
  const href = `/creators/creator-profile/${creator.id}`;

  useEffect(() => {
    // Só sincronizar se:
    // 1. Não houve ação do usuário recente (últimos 5 segundos)
    // 2. O valor do prop é diferente do último valor confirmado
    // 3. O valor do prop não é null/undefined
    const timeSinceLastAction = Date.now() - lastActionTimeRef.current;
    const followingValue = creator.following;
    const shouldSync =
      !isUserActionRef.current &&
      timeSinceLastAction > 5000 &&
      followingValue !== undefined &&
      followingValue !== null &&
      followingValue !== lastConfirmedValueRef.current;

    if (shouldSync) {
      setIsFollowing(followingValue);
      lastConfirmedValueRef.current = followingValue;
    }
  }, [creator.following]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    isUserActionRef.current = true;
    lastActionTimeRef.current = Date.now();

    try {
      const response = await creatorsApi.toggleFollow(creator.id);
      if (response) {
        const newFollowingValue = response.is_following;
        setIsFollowing(newFollowingValue);
        lastConfirmedValueRef.current = newFollowingValue;

        // Atualizar TODAS as queries de lista de creators (com qualquer filtro)
        queryClient.setQueriesData(
          { queryKey: queryKeys.creators.lists(), exact: false },
          (oldData: any) => {
            if (!oldData?.data) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((c: Creator) =>
                c.id === creator.id ? { ...c, following: newFollowingValue } : c
              ),
            };
          }
        );

        // Atualizar também a query de detail do creator (caso esteja aberta)
        queryClient.setQueryData(
          queryKeys.creators.detail(creator.id),
          (oldData: Creator | undefined) => {
            if (!oldData) return oldData;
            return { ...oldData, following: newFollowingValue };
          }
        );

        // Fazer refetch silencioso em background após um delay
        // Isso garante que o servidor tenha processado a mudança
        setTimeout(async () => {
          try {
            await queryClient.refetchQueries({
              queryKey: queryKeys.creators.all,
              exact: false,
              type: 'active', // Só refazer queries ativas (em uso)
            });
          } catch (error) {
            console.error('Error refetching creators:', error);
          } finally {
            // Só permitir sincronização automática após o refetch completar
            isUserActionRef.current = false;
          }
        }, 1000);
      } else {
        setIsFollowing(!newFollowingState);
        isUserActionRef.current = false;
        lastActionTimeRef.current = 0;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      setIsFollowing(!newFollowingState);
      isUserActionRef.current = false;
      lastActionTimeRef.current = 0;
    }
  };

  return (
    <div className="creator-card-bg h-full">
      <Link
        href={href}
        prefetch={true}
        onMouseEnter={() => prefetchRoute(href)}
        className="flex flex-col h-full"
      >
        <div className="relative h-[110px] w-full rounded-t-lg overflow-hidden">
          {creator.banner ? (
            <Image src={creator.banner} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-red-dark to-red-primary" />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/50" />
        </div>

        <div className="card-content flex-1">
          <div className="relative size-[88px] rounded-full overflow-hidden border-4 border-surface -mt-[60px] bg-surface shrink-0">
            {creator.dp ? (
              <Image
                src={creator.dp}
                alt={creator.name || 'Creator'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-red-primary to-red-dark flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {(creator.name || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between gap-[10px]">
              <div>
                <p className="text-[18px] font-medium text-white">{creator.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-xs text-text-secondary border border-white/10">
                    <Video className="w-3.5 h-3.5" />
                    <span className="font-medium">{creator.videos_count || 0}</span>
                    <span className="uppercase tracking-wide text-[10px] opacity-70">Videos</span>
                  </span>
                </div>
              </div>

              <div className="hidden md:block">
                <button
                  onClick={handleFollow}
                  aria-pressed={isFollowing}
                  className={`btn btn-sm min-w-24 justify-center transition-all ${
                    isFollowing
                      ? 'bg-transparent border border-white/30 text-white/80 hover:border-white/50 hover:text-white hover:bg-white/5'
                      : 'btn-primary'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Following
                    </>
                  ) : (
                    'Follow'
                  )}
                </button>
              </div>
            </div>

            <p className="text-[14px] font-normal text-[#9D9D9D] mt-3 line-clamp-3">
              {creator.description}
            </p>
          </div>
        </div>

        <div className="md:hidden">
          <button
            onClick={handleFollow}
            aria-pressed={isFollowing}
            className={`btn btn-sm w-[93%] mx-auto my-[15px] min-w-[120px] justify-center transition-all ${
              isFollowing
                ? 'bg-transparent border border-white/30 text-white/80 hover:border-white/50 hover:text-white hover:bg-white/5'
                : 'btn-primary'
            }`}
          >
            {isFollowing ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Following
              </>
            ) : (
              'Follow'
            )}
          </button>
        </div>
      </Link>
    </div>
  );
}
