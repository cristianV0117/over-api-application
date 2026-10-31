"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
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
  deleteAnime,
  fetchAnimeGenres,
  fetchAnimeStats,
  fetchMyAnime,
  fetchRecommendations,
  searchAnime,
  updateAnime,
  WATCH_STATUSES,
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

export default function AnimeLibraryPage() {
  const { t } = usePreferences();
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
  const [results, setResults] = useState<AnimeSearchItem[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(true);
  const [open, setOpen] = useState<AnimeEntry | null>(null);
  const [recs, setRecs] = useState<AnimeRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
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

  const loadCatalog = useCallback(
    async (nextPage = 1, append = false) => {
      setSearching(true);
      try {
        const res = await searchAnime(appliedQ, {
          page: nextPage,
          genre: genre || undefined,
          format: format || undefined,
          sort: sort || undefined,
        });
        setResults((prev) => (append ? [...prev, ...res.items] : res.items));
        setHasNext(res.hasNextPage);
        setPage(res.page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("anime.searchError"));
      } finally {
        setSearching(false);
      }
    },
    [appliedQ, genre, format, sort, t]
  );

  useEffect(() => {
    void loadCatalog(1, false);
  }, [loadCatalog]);

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
    if (!open) return;
    try {
      const updated = await updateAnime(open.id, patch);
      setOpen(updated);
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
      setOpen(null);
      setStats(await fetchAnimeStats());
      setRecs([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("anime.saveError"));
    }
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
          </Paper>

          {searching && results.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ ...GRID_SX, mb: 2 }}>
                {results.map((item) => (
                  <Paper key={item.anilistId} variant="outlined" sx={{ overflow: "hidden" }}>
                    <Box
                      component="img"
                      src={item.coverImage}
                      alt=""
                      sx={{ width: "100%", height: 230, objectFit: "cover", display: "block" }}
                    />
                    <Box sx={{ p: 1.1 }}>
                      <Typography fontWeight={700} noWrap variant="body2">
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.seasonYear ?? "—"}
                        {item.anilistScore != null ? ` · ${item.anilistScore}%` : ""}
                        {item.format ? ` · ${item.format}` : ""}
                      </Typography>
                      {inLibrary.has(item.anilistId) ? (
                        <Chip size="small" label={t("anime.inLibrary")} sx={{ mt: 0.5 }} />
                      ) : (
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                          <Button
                            size="small"
                            sx={{ px: 0.5, minWidth: 0 }}
                            onClick={() => void add(item, "completed")}
                          >
                            {t("anime.addSeen")}
                          </Button>
                          <Button
                            size="small"
                            sx={{ px: 0.5, minWidth: 0 }}
                            onClick={() => void add(item, "planned")}
                          >
                            {t("anime.status.planned")}
                          </Button>
                        </Stack>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
              {hasNext && (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                  <Button
                    variant="outlined"
                    disabled={searching}
                    onClick={() => void loadCatalog(page + 1, true)}
                  >
                    {t("anime.loadMore")}
                  </Button>
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
            <Box sx={GRID_SX}>
              {visibleRecs.map((item) => (
                <Paper key={item.anilistId} variant="outlined" sx={{ overflow: "hidden" }}>
                  <Box
                    component="img"
                    src={item.coverImage}
                    alt=""
                    sx={{ width: "100%", height: 230, objectFit: "cover", display: "block" }}
                  />
                  <Box sx={{ p: 1.1 }}>
                    <Typography fontWeight={700} noWrap variant="body2">
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                      {item.seasonYear ?? "—"}
                      {item.anilistScore != null ? ` · ${item.anilistScore}%` : ""}
                      {item.format ? ` · ${item.format}` : ""}
                    </Typography>
                    {item.because.length > 0 && (
                      <Typography
                        variant="caption"
                        color="primary"
                        display="block"
                        noWrap
                        title={item.because.join(" · ")}
                        sx={{ mt: 0.25 }}
                      >
                        {t("anime.because")}: {item.because.join(" · ")}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Button
                        size="small"
                        sx={{ px: 0.5, minWidth: 0 }}
                        onClick={() => void add(item, "completed")}
                      >
                        {t("anime.addSeen")}
                      </Button>
                      <Button
                        size="small"
                        sx={{ px: 0.5, minWidth: 0 }}
                        onClick={() => void add(item, "planned")}
                      >
                        {t("anime.status.planned")}
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Box>
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
            <Box sx={GRID_SX}>
              {visibleLibrary.map((a) => (
                <Paper
                  key={a.id}
                  variant="outlined"
                  onClick={() => setOpen(a)}
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
          )}
        </>
      )}

      <Dialog open={Boolean(open)} onClose={() => setOpen(null)} maxWidth="sm" fullWidth>
        {open && (
          <DialogContent sx={{ p: 0 }}>
            {open.bannerImage && (
              <Box
                component="img"
                src={open.bannerImage}
                alt=""
                sx={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
              />
            )}
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    {open.title}
                  </Typography>
                  {open.titleEnglish && open.titleEnglish !== open.title && (
                    <Typography variant="body2" color="text.secondary">
                      {open.titleEnglish}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  onClick={() => void saveOpen({ favorite: !open.favorite })}
                  color={open.favorite ? "error" : "default"}
                >
                  {open.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Stack>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ my: 1 }}>
                {open.genres.map((g) => (
                  <Chip key={g} size="small" label={g} />
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {open.description}
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={open.watchStatus}
                onChange={(_, v: AnimeWatchStatus | null) => v && void saveOpen({ watchStatus: v })}
                sx={{ mb: 2, flexWrap: "wrap" }}
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
                value={open.score ?? 0}
                onChange={(_, v) => void saveOpen({ score: v || null })}
                sx={{ display: "flex", mb: 2 }}
              />
              <TextField
                size="small"
                type="number"
                label={t("anime.episodes")}
                value={open.watchedEpisodes}
                onChange={(e) =>
                  void saveOpen({ watchedEpisodes: Math.max(0, Number(e.target.value) || 0) })
                }
                helperText={open.episodes ? `${t("anime.of")} ${open.episodes}` : undefined}
                sx={{ mb: 2, width: 160 }}
              />
              <TextField
                label={t("anime.notes")}
                value={open.notes}
                onChange={(e) => setOpen({ ...open, notes: e.target.value })}
                onBlur={() => void saveOpen({ notes: open.notes })}
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                {open.siteUrl ? (
                  <Button href={open.siteUrl} target="_blank" rel="noopener noreferrer">
                    AniList
                  </Button>
                ) : (
                  <span />
                )}
                <Button color="error" onClick={() => void remove(open.id)}>
                  {t("anime.remove")}
                </Button>
              </Stack>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}
