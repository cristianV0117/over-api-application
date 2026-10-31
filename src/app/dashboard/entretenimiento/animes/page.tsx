"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import SearchIcon from "@mui/icons-material/Search";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import { toast } from "react-toastify";
import { usePreferences } from "@/context/preferencesContext";
import type { MessageKey } from "@/i18n/messages/es";
import {
  addAnime,
  clearMyAnime,
  deleteAnime,
  fetchAnimeDetail,
  fetchAnimeGenres,
  fetchAnimeStats,
  fetchMyAnime,
  fetchRecommendations,
  searchAnime,
  updateAnime,
  WATCH_STATUSES,
  type AnimeDetail,
  type AnimeEntry,
  type AnimeRecommendation,
  type AnimeSearchItem,
  type AnimeStats,
  type AnimeWatchStatus,
} from "@/lib/api/anime";

const STATUS_KEY: Record<AnimeWatchStatus, MessageKey> = {
  watching: "anime.status.watching",
  completed: "anime.status.completed",
  planned: "anime.status.planned",
  dropped: "anime.status.dropped",
  paused: "anime.status.paused",
};

const GRID_SX = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: 1.5,
} as const;

const PAGE_SIZE = 24;

function isAiring(status?: string) {
  return status === "RELEASING";
}

function formatAiring(ts: number, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts * 1000));
}

export default function AnimeLibraryPage() {
  const { t, locale } = usePreferences();
  const [tab, setTab] = useState(0);
  const [library, setLibrary] = useState<AnimeEntry[]>([]);
  const [stats, setStats] = useState<AnimeStats | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [status, setStatus] = useState<AnimeWatchStatus | "">("");
  const [genre, setGenre] = useState("");
  const [libGenre, setLibGenre] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [libQ, setLibQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [format, setFormat] = useState("");
  const [sort, setSort] = useState("POPULARITY_DESC");
  const [mainOnly, setMainOnly] = useState(true);
  const [results, setResults] = useState<AnimeSearchItem[]>([]);
  const [lastPage, setLastPage] = useState(1);
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(true);
  const [recs, setRecs] = useState<AnimeRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsPage, setRecsPage] = useState(1);
  const [libPage, setLibPage] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AnimeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const inLibrary = useMemo(
    () => new Set(library.map((a) => a.anilistId)),
    [library]
  );
  const visibleLibrary = useMemo(() => {
    const query = libQ.trim().toLowerCase();
    return library.filter((a) => {
      if (status && a.watchStatus !== status) return false;
      if (onlyFav && !a.favorite) return false;
      if (libGenre && !a.genres.includes(libGenre)) return false;
      if (
        query &&
        !a.title.toLowerCase().includes(query) &&
        !a.titleEnglish.toLowerCase().includes(query) &&
        !a.titleNative.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [library, status, onlyFav, libGenre, libQ]);
  const visibleRecs = useMemo(
    () => recs.filter((item) => !inLibrary.has(item.anilistId)),
    [recs, inLibrary]
  );
  const recsPageCount = Math.max(1, Math.ceil(visibleRecs.length / PAGE_SIZE));
  const libPageCount = Math.max(1, Math.ceil(visibleLibrary.length / PAGE_SIZE));
  const pagedRecs = visibleRecs.slice((recsPage - 1) * PAGE_SIZE, recsPage * PAGE_SIZE);
  const pagedLibrary = visibleLibrary.slice((libPage - 1) * PAGE_SIZE, libPage * PAGE_SIZE);
  const openEntry = detailId != null ? library.find((a) => a.anilistId === detailId) : undefined;

  const loadRecs = useCallback(async () => {
    setRecsLoading(true);
    try {
      setRecs(await fetchRecommendations());
    } catch {
      setRecs([]);
    } finally {
      setRecsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    const [list, st] = await Promise.all([fetchMyAnime(), fetchAnimeStats()]);
    setLibrary(list);
    setStats(st);
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (tab === 1) void loadRecs();
  }, [tab, loadRecs]);

  useEffect(() => {
    fetchAnimeGenres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    setLibPage(1);
  }, [status, onlyFav, libGenre, libQ]);

  useEffect(() => {
    setRecsPage(1);
  }, [visibleRecs.length]);

  const loadCatalog = useCallback(
    async (nextPage = 1) => {
      setSearching(true);
      try {
        const res = await searchAnime(appliedQ, {
          page: nextPage,
          genre: genre || undefined,
          format: format || undefined,
          sort: sort || undefined,
          mainOnly,
        });
        setResults(res.items);
        setLastPage(Math.max(1, res.lastPage || res.page));
        setPage(res.page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("anime.searchError"));
      } finally {
        setSearching(false);
      }
    },
    [appliedQ, genre, format, sort, mainOnly, t]
  );

  useEffect(() => {
    void loadCatalog(1);
  }, [loadCatalog]);

  useEffect(() => {
    if (detailId == null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    fetchAnimeDetail(detailId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e: Error) => {
        if (!cancelled) toast.error(e.message);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detailId]);

  const runSearch = () => {
    setAppliedQ(q.trim());
  };

  const add = async (item: AnimeSearchItem, watchStatus: AnimeWatchStatus) => {
    try {
      const created = await addAnime({ anilistId: item.anilistId, watchStatus });
      setLibrary((prev) => [created, ...prev]);
      setStats(await fetchAnimeStats());
      if (tab === 1) void loadRecs();
      toast.success(t("anime.added"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("anime.addError"));
    }
  };

  const saveOpen = async (patch: Partial<AnimeEntry>) => {
    if (!openEntry) return;
    try {
      const updated = await updateAnime(openEntry.id, patch);
      setLibrary((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      if (
        patch.watchStatus !== undefined ||
        patch.score !== undefined ||
        patch.favorite !== undefined
      ) {
        setRecs([]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("anime.saveError"));
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteAnime(id);
      setLibrary((prev) => prev.filter((x) => x.id !== id));
      setDetailId(null);
      setStats(await fetchAnimeStats());
      setRecs([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("anime.saveError"));
    }
  };

  const emptyLibrary = async () => {
    setClearing(true);
    try {
      await clearMyAnime();
      setLibrary([]);
      setStats(await fetchAnimeStats());
      setRecs([]);
      setDetailId(null);
      setConfirmClear(false);
      toast.success(t("anime.clearDone"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("anime.saveError"));
    } finally {
      setClearing(false);
    }
  };

  const airingLabel = (item: {
    anilistStatus?: string;
    nextEpisode?: { episode: number; airingAt: number } | null;
  }) => {
    if (!isAiring(item.anilistStatus) && !item.nextEpisode) return null;
    if (item.nextEpisode) {
      return `${t("anime.nextEp")} ${item.nextEpisode.episode} · ${formatAiring(item.nextEpisode.airingAt, locale)}`;
    }
    return t("anime.airing");
  };

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto" }}>
      <Typography variant="h4" fontWeight={800}>
        {t("anime.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t("anime.subtitle")}
      </Typography>

      <Box
        sx={{
          mb: 2,
          borderBottom: 1,
          borderColor: "divider",
          width: "100%",
          minWidth: 0,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          aria-label={t("anime.tabAria")}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab
            icon={<LiveTvOutlinedIcon />}
            iconPosition="start"
            label={t("anime.tabCatalog")}
            id="page-tab-animes"
          />
          <Tab
            icon={<AutoAwesomeOutlinedIcon />}
            iconPosition="start"
            label={t("anime.tabRecs")}
            id="page-tab-recomendados"
          />
          <Tab
            icon={<VideoLibraryOutlinedIcon />}
            iconPosition="start"
            label={t("anime.tabLibrary")}
            id="page-tab-biblioteca"
          />
        </Tabs>
      </Box>

      {tab === 0 && (
        <>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack spacing={1.25}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
                <TextField
                  size="small"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder={t("anime.searchPh")}
                  sx={{ flex: "1 1 220px" }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>{t("anime.genre")}</InputLabel>
                  <Select
                    value={genre}
                    label={t("anime.genre")}
                    onChange={(e) => setGenre(e.target.value)}
                  >
                    <MenuItem value="">{t("anime.allGenres")}</MenuItem>
                    {genres.map((g) => (
                      <MenuItem key={g} value={g}>
                        {g}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>{t("anime.format")}</InputLabel>
                  <Select
                    value={format}
                    label={t("anime.format")}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <MenuItem value="">{t("anime.allFormats")}</MenuItem>
                    <MenuItem value="TV">TV</MenuItem>
                    <MenuItem value="MOVIE">Movie</MenuItem>
                    <MenuItem value="OVA">OVA</MenuItem>
                    <MenuItem value="ONA">ONA</MenuItem>
                    <MenuItem value="SPECIAL">Special</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>{t("anime.sort")}</InputLabel>
                  <Select
                    value={sort}
                    label={t("anime.sort")}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <MenuItem value="POPULARITY_DESC">{t("anime.sort.popular")}</MenuItem>
                    <MenuItem value="SCORE_DESC">{t("anime.sort.score")}</MenuItem>
                    <MenuItem value="TRENDING_DESC">{t("anime.sort.trending")}</MenuItem>
                    <MenuItem value="START_DATE_DESC">{t("anime.sort.newest")}</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                  onClick={runSearch}
                  disabled={searching}
                >
                  {t("anime.search")}
                </Button>
              </Stack>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={mainOnly ? "main" : "all"}
                onChange={(_, v: "main" | "all" | null) => v && setMainOnly(v === "main")}
              >
                <ToggleButton value="main">{t("anime.scope.main")}</ToggleButton>
                <ToggleButton value="all">{t("anime.scope.all")}</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Paper>

          {searching && results.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ ...GRID_SX, mb: 2, opacity: searching ? 0.6 : 1 }}>
                {results.map((item) => (
                  <CatalogCard
                    key={item.anilistId}
                    item={item}
                    inLibrary={inLibrary.has(item.anilistId)}
                    airing={airingLabel(item)}
                    because={null}
                    t={t}
                    onOpen={() => setDetailId(item.anilistId)}
                    onAdd={(s) => void add(item, s)}
                  />
                ))}
              </Box>
              {lastPage > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                  <Pagination
                    color="primary"
                    count={lastPage}
                    page={page}
                    disabled={searching}
                    onChange={(_, p) => void loadCatalog(p)}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {tab === 1 && (
        <>
          {recsLoading && visibleRecs.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : visibleRecs.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {stats?.total ? t("anime.recsError") : t("anime.recsHint")}
              </Typography>
            </Paper>
          ) : (
            <>
              <Box sx={GRID_SX}>
                {pagedRecs.map((item) => (
                  <CatalogCard
                    key={item.anilistId}
                    item={item}
                    inLibrary={false}
                    airing={airingLabel(item)}
                    because={item.because.length ? `${t("anime.because")}: ${item.because.join(" · ")}` : null}
                    t={t}
                    onOpen={() => setDetailId(item.anilistId)}
                    onAdd={(s) => void add(item, s)}
                  />
                ))}
              </Box>
              {recsPageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 3 }}>
                  <Pagination
                    color="primary"
                    count={recsPageCount}
                    page={Math.min(recsPage, recsPageCount)}
                    onChange={(_, p) => setRecsPage(p)}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {tab === 2 && (
        <>
          {stats && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <Chip label={`${stats.total} ${t("anime.total")}`} />
              {WATCH_STATUSES.map((s) => (
                <Chip
                  key={s}
                  label={`${t(STATUS_KEY[s])}: ${stats.byStatus[s]?.count ?? 0}`}
                  variant={status === s ? "filled" : "outlined"}
                  onClick={() => setStatus((cur) => (cur === s ? "" : s))}
                />
              ))}
              {stats.avgScore != null && (
                <Chip color="primary" label={`${t("anime.avg")}: ${stats.avgScore.toFixed(1)}`} />
              )}
            </Stack>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "center" }}
            sx={{ mb: 1.5 }}
          >
            <TextField
              size="small"
              value={libQ}
              onChange={(e) => setLibQ(e.target.value)}
              placeholder={t("anime.filterPh")}
              sx={{ minWidth: 200, flex: "1 1 180px" }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t("anime.genre")}</InputLabel>
              <Select
                value={libGenre}
                label={t("anime.genre")}
                onChange={(e) => setLibGenre(e.target.value)}
              >
                <MenuItem value="">{t("anime.allGenres")}</MenuItem>
                {genres.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ToggleButton
              value="fav"
              selected={onlyFav}
              onChange={() => setOnlyFav((v) => !v)}
              size="small"
            >
              {t("anime.favorites")}
            </ToggleButton>
            <Button
              color="error"
              variant="outlined"
              size="small"
              disabled={!library.length}
              onClick={() => setConfirmClear(true)}
            >
              {t("anime.clear")}
            </Button>
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : visibleLibrary.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">{t("anime.empty")}</Typography>
            </Paper>
          ) : (
            <>
              <Box sx={GRID_SX}>
                {pagedLibrary.map((a) => (
                  <Paper
                    key={a.id}
                    variant="outlined"
                    onClick={() => setDetailId(a.anilistId)}
                    sx={{
                      cursor: "pointer",
                      overflow: "hidden",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={a.coverImage}
                        alt=""
                        sx={{ width: "100%", height: 230, objectFit: "cover", display: "block" }}
                      />
                      {isAiring(a.anilistStatus) && (
                        <Chip
                          size="small"
                          color="success"
                          label={t("anime.airing")}
                          sx={{ position: "absolute", top: 8, left: 8 }}
                        />
                      )}
                      {a.favorite && (
                        <FavoriteIcon
                          sx={{ position: "absolute", top: 8, right: 8, color: "#f43f5e", fontSize: 22 }}
                        />
                      )}
                    </Box>
                    <Box sx={{ p: 1.1 }}>
                      <Typography fontWeight={700} noWrap variant="body2">
                        {a.title}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {t(STATUS_KEY[a.watchStatus])}
                        </Typography>
                        {a.score != null && (
                          <Typography variant="caption" fontWeight={700}>
                            {a.score}/10
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Paper>
                ))}
              </Box>
              {libPageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 3 }}>
                  <Pagination
                    color="primary"
                    count={libPageCount}
                    page={Math.min(libPage, libPageCount)}
                    onChange={(_, p) => setLibPage(p)}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      <Dialog
        open={detailId != null}
        onClose={() => setDetailId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {detailLoading && !detail ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : detail ? (
            <>
              {(detail.bannerImage || openEntry?.bannerImage) && (
                <Box
                  component="img"
                  src={detail.bannerImage || openEntry?.bannerImage}
                  alt=""
                  sx={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                />
              )}
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="h6" fontWeight={800}>
                        {detail.title}
                      </Typography>
                      {isAiring(detail.anilistStatus) && (
                        <Chip size="small" color="success" label={t("anime.airing")} />
                      )}
                    </Stack>
                    {detail.titleEnglish && detail.titleEnglish !== detail.title && (
                      <Typography variant="body2" color="text.secondary">
                        {detail.titleEnglish}
                      </Typography>
                    )}
                    {detail.nextEpisode && (
                      <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                        {t("anime.nextEp")} {detail.nextEpisode.episode} ·{" "}
                        {formatAiring(detail.nextEpisode.airingAt, locale)}
                      </Typography>
                    )}
                  </Box>
                  {openEntry && (
                    <IconButton
                      onClick={() => void saveOpen({ favorite: !openEntry.favorite })}
                      color={openEntry.favorite ? "error" : "default"}
                    >
                      {openEntry.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  )}
                </Stack>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ my: 1 }}>
                  {detail.genres.map((g) => (
                    <Chip key={g} size="small" label={g} />
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {detail.description}
                </Typography>

                <RelationRow
                  title={t("anime.relSeasons")}
                  items={detail.relations.seasons}
                  onOpen={setDetailId}
                />
                <RelationRow
                  title={t("anime.relMovies")}
                  items={detail.relations.movies}
                  onOpen={setDetailId}
                />
                <RelationRow
                  title={t("anime.relOvas")}
                  items={detail.relations.ovas}
                  onOpen={setDetailId}
                />
                <RelationRow
                  title={t("anime.relOthers")}
                  items={detail.relations.others}
                  onOpen={setDetailId}
                />

                {openEntry ? (
                  <>
                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      size="small"
                      value={openEntry.watchStatus}
                      onChange={(_, v: AnimeWatchStatus | null) =>
                        v && void saveOpen({ watchStatus: v })
                      }
                      sx={{ mb: 2, mt: 1, flexWrap: "wrap" }}
                    >
                      {WATCH_STATUSES.map((s) => (
                        <ToggleButton key={s} value={s} sx={{ flex: "1 1 30%" }}>
                          {t(STATUS_KEY[s])}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <Typography variant="caption" color="text.secondary">
                      {t("anime.yourScore")}
                    </Typography>
                    <Rating
                      max={10}
                      value={openEntry.score ?? 0}
                      onChange={(_, v) => void saveOpen({ score: v || null })}
                      sx={{ display: "flex", mb: 2 }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      label={t("anime.episodes")}
                      value={openEntry.watchedEpisodes}
                      onChange={(e) =>
                        void saveOpen({
                          watchedEpisodes: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      helperText={
                        openEntry.episodes ? `${t("anime.of")} ${openEntry.episodes}` : undefined
                      }
                      sx={{ mb: 2, width: 160 }}
                    />
                    <TextField
                      label={t("anime.notes")}
                      defaultValue={openEntry.notes}
                      key={openEntry.id}
                      onBlur={(e) => void saveOpen({ notes: e.target.value })}
                      multiline
                      minRows={2}
                      fullWidth
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                      {detail.siteUrl ? (
                        <Button href={detail.siteUrl} target="_blank" rel="noopener noreferrer">
                          AniList
                        </Button>
                      ) : (
                        <span />
                      )}
                      <Button color="error" onClick={() => void remove(openEntry.id)}>
                        {t("anime.remove")}
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button variant="contained" onClick={() => void add(detail, "completed")}>
                      {t("anime.addSeen")}
                    </Button>
                    <Button variant="outlined" onClick={() => void add(detail, "planned")}>
                      {t("anime.status.planned")}
                    </Button>
                    {detail.siteUrl && (
                      <Button href={detail.siteUrl} target="_blank" rel="noopener noreferrer">
                        AniList
                      </Button>
                    )}
                  </Stack>
                )}
              </Box>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)}>
        <DialogTitle>{t("anime.clear")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("anime.clearConfirm")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>{t("anime.cancel")}</Button>
          <Button color="error" variant="contained" disabled={clearing} onClick={() => void emptyLibrary()}>
            {t("anime.clearOk")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function CatalogCard({
  item,
  inLibrary,
  airing,
  because,
  t,
  onOpen,
  onAdd,
}: {
  item: AnimeSearchItem;
  inLibrary: boolean;
  airing: string | null;
  because: string | null;
  t: (key: MessageKey) => string;
  onOpen: () => void;
  onAdd: (status: AnimeWatchStatus) => void;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onOpen}
      sx={{ cursor: "pointer", overflow: "hidden", "&:hover": { borderColor: "primary.main" } }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          component="img"
          src={item.coverImage}
          alt=""
          sx={{ width: "100%", height: 230, objectFit: "cover", display: "block" }}
        />
        {isAiring(item.anilistStatus) && (
          <Chip
            size="small"
            color="success"
            label={t("anime.airing")}
            sx={{ position: "absolute", top: 8, left: 8 }}
          />
        )}
      </Box>
      <Box sx={{ p: 1.1 }}>
        <Typography fontWeight={700} noWrap variant="body2">
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" noWrap>
          {item.seasonYear ?? "—"}
          {item.anilistScore != null ? ` · ${item.anilistScore}%` : ""}
          {item.format ? ` · ${item.format}` : ""}
        </Typography>
        {airing && (
          <Typography variant="caption" color="primary" display="block" noWrap title={airing}>
            {airing}
          </Typography>
        )}
        {because && (
          <Typography variant="caption" color="primary" display="block" noWrap title={because} sx={{ mt: 0.25 }}>
            {because}
          </Typography>
        )}
        {inLibrary ? (
          <Chip size="small" label={t("anime.inLibrary")} sx={{ mt: 0.5 }} />
        ) : (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} onClick={(e) => e.stopPropagation()}>
            <Button size="small" sx={{ px: 0.5, minWidth: 0 }} onClick={() => onAdd("completed")}>
              {t("anime.addSeen")}
            </Button>
            <Button size="small" sx={{ px: 0.5, minWidth: 0 }} onClick={() => onAdd("planned")}>
              {t("anime.status.planned")}
            </Button>
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

function RelationRow({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: AnimeSearchItem[];
  onOpen: (id: number) => void;
}) {
  if (!items.length) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
        {items.map((item) => (
          <Paper
            key={item.anilistId}
            variant="outlined"
            onClick={() => onOpen(item.anilistId)}
            sx={{
              minWidth: 112,
              maxWidth: 112,
              cursor: "pointer",
              overflow: "hidden",
              flex: "0 0 auto",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            <Box
              component="img"
              src={item.coverImage}
              alt=""
              sx={{ width: "100%", height: 148, objectFit: "cover", display: "block" }}
            />
            <Typography variant="caption" fontWeight={700} noWrap display="block" sx={{ px: 0.75, py: 0.5 }}>
              {item.title}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
