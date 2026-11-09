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
import SearchIcon from "@mui/icons-material/Search";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import VideogameAssetOutlinedIcon from "@mui/icons-material/VideogameAssetOutlined";
import { toast } from "react-toastify";
import { usePreferences } from "@/context/preferencesContext";
import type { MessageKey } from "@/i18n/messages/es";
import {
  addGame,
  clearMyGames,
  deleteGame,
  fetchGameDetail,
  fetchGameGenres,
  fetchGameRecommendations,
  fetchGameStats,
  fetchMyGames,
  searchGames,
  updateGame,
  PLAY_STATUSES,
  type GameDetail,
  type GameEntry,
  type GameGenre,
  type GamePlayStatus,
  type GameRecommendation,
  type GameSearchItem,
  type GameStats,
} from "@/lib/api/game";

const STATUS_KEY: Record<GamePlayStatus, MessageKey> = {
  playing: "game.status.playing",
  completed: "game.status.completed",
  planned: "game.status.planned",
  dropped: "game.status.dropped",
  paused: "game.status.paused",
};

const PLATFORMS = [
  { id: "1", name: "PC" },
  { id: "2", name: "PlayStation" },
  { id: "3", name: "Xbox" },
  { id: "7", name: "Nintendo" },
  { id: "8", name: "Android" },
  { id: "4", name: "iOS" },
];

const GRID_SX = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: 1.5,
} as const;

const PAGE_SIZE = 24;

function statusChip(status: string, t: (k: MessageKey) => string) {
  if (status === "COMING") return t("game.coming");
  if (status === "NEW") return t("game.new");
  return null;
}

export default function GameLibraryPage() {
  const { t } = usePreferences();
  const [tab, setTab] = useState(0);
  const [library, setLibrary] = useState<GameEntry[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [genres, setGenres] = useState<GameGenre[]>([]);
  const [status, setStatus] = useState<GamePlayStatus | "">("");
  const [genre, setGenre] = useState("");
  const [libGenre, setLibGenre] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [libQ, setLibQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [platform, setPlatform] = useState("");
  const [sort, setSort] = useState("POPULARITY_DESC");
  const [mainOnly, setMainOnly] = useState(true);
  const [results, setResults] = useState<GameSearchItem[]>([]);
  const [lastPage, setLastPage] = useState(1);
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(true);
  const [recs, setRecs] = useState<GameRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsPage, setRecsPage] = useState(1);
  const [libPage, setLibPage] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const inLibrary = useMemo(
    () => new Set(library.map((a) => a.rawgId)),
    [library]
  );
  const visibleLibrary = useMemo(() => {
    const query = libQ.trim().toLowerCase();
    return library.filter((a) => {
      if (status && a.playStatus !== status) return false;
      if (onlyFav && !a.favorite) return false;
      if (libGenre && !a.genres.includes(libGenre)) return false;
      if (query && !a.title.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [library, status, onlyFav, libGenre, libQ]);
  const visibleRecs = useMemo(
    () => recs.filter((item) => !inLibrary.has(item.rawgId)),
    [recs, inLibrary]
  );
  const recsPageCount = Math.max(1, Math.ceil(visibleRecs.length / PAGE_SIZE));
  const libPageCount = Math.max(1, Math.ceil(visibleLibrary.length / PAGE_SIZE));
  const pagedRecs = visibleRecs.slice((recsPage - 1) * PAGE_SIZE, recsPage * PAGE_SIZE);
  const pagedLibrary = visibleLibrary.slice((libPage - 1) * PAGE_SIZE, libPage * PAGE_SIZE);
  const openEntry = detailId != null ? library.find((a) => a.rawgId === detailId) : undefined;

  const loadRecs = useCallback(async () => {
    setRecsLoading(true);
    try {
      setRecs(await fetchGameRecommendations());
    } catch {
      setRecs([]);
    } finally {
      setRecsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    const [list, st] = await Promise.all([fetchMyGames(), fetchGameStats()]);
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
    fetchGameGenres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => setLibPage(1), [status, onlyFav, libGenre, libQ]);
  useEffect(() => setRecsPage(1), [visibleRecs.length]);

  const loadCatalog = useCallback(
    async (nextPage = 1) => {
      setSearching(true);
      try {
        const res = await searchGames(appliedQ, {
          page: nextPage,
          genre: genre || undefined,
          platform: platform || undefined,
          sort: sort || undefined,
          mainOnly,
        });
        setResults(res.items);
        setLastPage(Math.max(1, res.lastPage || res.page));
        setPage(res.page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("game.searchError"));
      } finally {
        setSearching(false);
      }
    },
    [appliedQ, genre, platform, sort, mainOnly, t]
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
    fetchGameDetail(detailId)
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

  const add = async (item: GameSearchItem, playStatus: GamePlayStatus) => {
    try {
      const created = await addGame({ rawgId: item.rawgId, playStatus });
      setLibrary((prev) => [created, ...prev]);
      setStats(await fetchGameStats());
      if (tab === 1) void loadRecs();
      toast.success(t("game.added"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("game.addError"));
    }
  };

  const saveOpen = async (patch: Partial<GameEntry>) => {
    if (!openEntry) return;
    try {
      const updated = await updateGame(openEntry.id, patch);
      setLibrary((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      if (
        patch.playStatus !== undefined ||
        patch.score !== undefined ||
        patch.favorite !== undefined
      ) {
        setRecs([]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("game.saveError"));
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteGame(id);
      setLibrary((prev) => prev.filter((x) => x.id !== id));
      setDetailId(null);
      setStats(await fetchGameStats());
      setRecs([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("game.saveError"));
    }
  };

  const emptyLibrary = async () => {
    setClearing(true);
    try {
      await clearMyGames();
      setLibrary([]);
      setStats(await fetchGameStats());
      setRecs([]);
      setDetailId(null);
      setConfirmClear(false);
      toast.success(t("game.clearDone"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("game.saveError"));
    } finally {
      setClearing(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto" }}>
      <Typography variant="h4" fontWeight={800}>
        {t("game.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t("game.subtitle")}
      </Typography>

      <Box sx={{ mb: 2, borderBottom: 1, borderColor: "divider", width: "100%", minWidth: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          aria-label={t("game.tabAria")}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab icon={<SportsEsportsOutlinedIcon />} iconPosition="start" label={t("game.tabCatalog")} />
          <Tab icon={<AutoAwesomeOutlinedIcon />} iconPosition="start" label={t("game.tabRecs")} />
          <Tab icon={<VideogameAssetOutlinedIcon />} iconPosition="start" label={t("game.tabLibrary")} />
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
                  onKeyDown={(e) => e.key === "Enter" && setAppliedQ(q.trim())}
                  placeholder={t("game.searchPh")}
                  sx={{ flex: "1 1 220px" }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>{t("game.genre")}</InputLabel>
                  <Select value={genre} label={t("game.genre")} onChange={(e) => setGenre(e.target.value)}>
                    <MenuItem value="">{t("game.allGenres")}</MenuItem>
                    {genres.map((g) => (
                      <MenuItem key={g.slug} value={g.slug}>
                        {g.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>{t("game.platform")}</InputLabel>
                  <Select
                    value={platform}
                    label={t("game.platform")}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <MenuItem value="">{t("game.allPlatforms")}</MenuItem>
                    {PLATFORMS.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>{t("game.sort")}</InputLabel>
                  <Select value={sort} label={t("game.sort")} onChange={(e) => setSort(e.target.value)}>
                    <MenuItem value="POPULARITY_DESC">{t("game.sort.popular")}</MenuItem>
                    <MenuItem value="SCORE_DESC">{t("game.sort.score")}</MenuItem>
                    <MenuItem value="TRENDING_DESC">{t("game.sort.trending")}</MenuItem>
                    <MenuItem value="START_DATE_DESC">{t("game.sort.newest")}</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                  onClick={() => setAppliedQ(q.trim())}
                  disabled={searching}
                >
                  {t("game.search")}
                </Button>
              </Stack>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={mainOnly ? "main" : "all"}
                onChange={(_, v: "main" | "all" | null) => v && setMainOnly(v === "main")}
              >
                <ToggleButton value="main">{t("game.scope.main")}</ToggleButton>
                <ToggleButton value="all">{t("game.scope.all")}</ToggleButton>
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
                    key={item.rawgId}
                    item={item}
                    inLibrary={inLibrary.has(item.rawgId)}
                    because={null}
                    t={t}
                    onOpen={() => setDetailId(item.rawgId)}
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
                {stats?.total ? t("game.recsError") : t("game.recsHint")}
              </Typography>
            </Paper>
          ) : (
            <>
              <Box sx={GRID_SX}>
                {pagedRecs.map((item) => (
                  <CatalogCard
                    key={item.rawgId}
                    item={item}
                    inLibrary={false}
                    because={item.because.length ? `${t("game.because")}: ${item.because.join(" · ")}` : null}
                    t={t}
                    onOpen={() => setDetailId(item.rawgId)}
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
              <Chip label={`${stats.total} ${t("game.total")}`} />
              {PLAY_STATUSES.map((s) => (
                <Chip
                  key={s}
                  label={`${t(STATUS_KEY[s])}: ${stats.byStatus[s]?.count ?? 0}`}
                  variant={status === s ? "filled" : "outlined"}
                  onClick={() => setStatus((cur) => (cur === s ? "" : s))}
                />
              ))}
              {stats.avgScore != null && (
                <Chip color="primary" label={`${t("game.avg")}: ${stats.avgScore.toFixed(1)}`} />
              )}
            </Stack>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} sx={{ mb: 1.5 }}>
            <TextField
              size="small"
              value={libQ}
              onChange={(e) => setLibQ(e.target.value)}
              placeholder={t("game.filterPh")}
              sx={{ minWidth: 200, flex: "1 1 180px" }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t("game.genre")}</InputLabel>
              <Select value={libGenre} label={t("game.genre")} onChange={(e) => setLibGenre(e.target.value)}>
                <MenuItem value="">{t("game.allGenres")}</MenuItem>
                {genres.map((g) => (
                  <MenuItem key={g.slug} value={g.name}>
                    {g.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ToggleButton value="fav" selected={onlyFav} onChange={() => setOnlyFav((v) => !v)} size="small">
              {t("game.favorites")}
            </ToggleButton>
            <Button
              color="error"
              variant="outlined"
              size="small"
              disabled={!library.length}
              onClick={() => setConfirmClear(true)}
            >
              {t("game.clear")}
            </Button>
          </Stack>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : visibleLibrary.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">{t("game.empty")}</Typography>
            </Paper>
          ) : (
            <>
              <Box sx={GRID_SX}>
                {pagedLibrary.map((a) => (
                  <Paper
                    key={a.id}
                    variant="outlined"
                    onClick={() => setDetailId(a.rawgId)}
                    sx={{ cursor: "pointer", overflow: "hidden", "&:hover": { borderColor: "primary.main" } }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={a.coverImage}
                        alt=""
                        sx={{ width: "100%", height: 230, objectFit: "cover", display: "block" }}
                      />
                      {statusChip(a.rawgStatus, t) && (
                        <Chip
                          size="small"
                          color={a.rawgStatus === "COMING" ? "info" : "success"}
                          label={statusChip(a.rawgStatus, t)}
                          sx={{ position: "absolute", top: 8, left: 8 }}
                        />
                      )}
                      {a.favorite && (
                        <FavoriteIcon sx={{ position: "absolute", top: 8, right: 8, color: "#f43f5e", fontSize: 22 }} />
                      )}
                    </Box>
                    <Box sx={{ p: 1.1 }}>
                      <Typography fontWeight={700} noWrap variant="body2">
                        {a.title}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {t(STATUS_KEY[a.playStatus])}
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

      <Dialog open={detailId != null} onClose={() => setDetailId(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {detailLoading && !detail ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : detail ? (
            <>
              {(detail.bannerImage || detail.coverImage) && (
                <Box
                  component="img"
                  src={detail.bannerImage || detail.coverImage}
                  alt=""
                  sx={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                />
              )}
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="h6" fontWeight={800}>
                        {detail.title}
                      </Typography>
                      {statusChip(detail.rawgStatus, t) && (
                        <Chip
                          size="small"
                          color={detail.rawgStatus === "COMING" ? "info" : "success"}
                          label={statusChip(detail.rawgStatus, t)}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {[detail.released || "—", detail.platforms.slice(0, 3).join(" · ")]
                        .filter(Boolean)
                        .join(" · ")}
                      {detail.rawgScore != null ? ` · ${detail.rawgScore}%` : ""}
                    </Typography>
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
                <RelationRow title={t("game.relSeries")} items={detail.relations.series} onOpen={setDetailId} />
                <RelationRow title={t("game.relExtras")} items={detail.relations.extras} onOpen={setDetailId} />
                {openEntry ? (
                  <>
                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      size="small"
                      value={openEntry.playStatus}
                      onChange={(_, v: GamePlayStatus | null) => v && void saveOpen({ playStatus: v })}
                      sx={{ mb: 2, mt: 1, flexWrap: "wrap" }}
                    >
                      {PLAY_STATUSES.map((s) => (
                        <ToggleButton key={s} value={s} sx={{ flex: "1 1 30%" }}>
                          {t(STATUS_KEY[s])}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <Typography variant="caption" color="text.secondary">
                      {t("game.yourScore")}
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
                      label={t("game.hours")}
                      value={openEntry.hoursPlayed}
                      onChange={(e) =>
                        void saveOpen({ hoursPlayed: Math.max(0, Number(e.target.value) || 0) })
                      }
                      sx={{ mb: 2, width: 160 }}
                    />
                    <TextField
                      label={t("game.notes")}
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
                          RAWG
                        </Button>
                      ) : (
                        <span />
                      )}
                      <Button color="error" onClick={() => void remove(openEntry.id)}>
                        {t("game.remove")}
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button variant="contained" onClick={() => void add(detail, "completed")}>
                      {t("game.addSeen")}
                    </Button>
                    <Button variant="outlined" onClick={() => void add(detail, "planned")}>
                      {t("game.status.planned")}
                    </Button>
                    {detail.siteUrl && (
                      <Button href={detail.siteUrl} target="_blank" rel="noopener noreferrer">
                        RAWG
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
        <DialogTitle>{t("game.clear")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("game.clearConfirm")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>{t("game.cancel")}</Button>
          <Button color="error" variant="contained" disabled={clearing} onClick={() => void emptyLibrary()}>
            {t("game.clearOk")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function CatalogCard({
  item,
  inLibrary,
  because,
  t,
  onOpen,
  onAdd,
}: {
  item: GameSearchItem;
  inLibrary: boolean;
  because: string | null;
  t: (key: MessageKey) => string;
  onOpen: () => void;
  onAdd: (status: GamePlayStatus) => void;
}) {
  const badge = statusChip(item.rawgStatus, t);
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
          sx={{ width: "100%", height: 230, objectFit: "cover", display: "block", bgcolor: "action.hover" }}
        />
        {badge && (
          <Chip
            size="small"
            color={item.rawgStatus === "COMING" ? "info" : "success"}
            label={badge}
            sx={{ position: "absolute", top: 8, left: 8 }}
          />
        )}
      </Box>
      <Box sx={{ p: 1.1 }}>
        <Typography fontWeight={700} noWrap variant="body2">
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" noWrap>
          {(item.released || "—").slice(0, 4)}
          {item.rawgScore != null ? ` · ${item.rawgScore}%` : ""}
          {item.platforms[0] ? ` · ${item.platforms[0]}` : ""}
        </Typography>
        {because && (
          <Typography variant="caption" color="primary" display="block" noWrap title={because} sx={{ mt: 0.25 }}>
            {because}
          </Typography>
        )}
        {inLibrary ? (
          <Chip size="small" label={t("game.inLibrary")} sx={{ mt: 0.5 }} />
        ) : (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} onClick={(e) => e.stopPropagation()}>
            <Button size="small" sx={{ px: 0.5, minWidth: 0 }} onClick={() => onAdd("completed")}>
              {t("game.addSeen")}
            </Button>
            <Button size="small" sx={{ px: 0.5, minWidth: 0 }} onClick={() => onAdd("planned")}>
              {t("game.status.planned")}
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
  items: GameSearchItem[];
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
            key={item.rawgId}
            variant="outlined"
            onClick={() => onOpen(item.rawgId)}
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
