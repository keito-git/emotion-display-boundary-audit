# Runtime check for S1-09 (filmicaesthetic/Art-and-Music,
# Poetry_Analysis_Visual_Emotions/app.R, sha256 71410522...)
#
# Static prediction (17_判定_S1群 §2):
#   missing -> 0.  A word carries no NRC emotion, so `total` is 0, every
#   `emotion / total` is NaN, `poem_sent[is.na(poem_sent)] <- 0` (:106) and
#   `poem_words[is.na(poem_words)] <- 0` (:141) turn it into 0, and the plot
#   feeds that 0 into `aes(alpha = emo_1)` with `scale_alpha(range = c(0, 1))`
#   (:211-214).  A word that IS in the lexicon but scores 0 on the displayed
#   emotion gets exactly the same alpha.  The two are not distinguished.
#
# poem_long (:78-112), poem_words (:114-143) and plot_lines (:176-229) are
# copied VERBATIM below.  Two substitutions, both disclosed:
#   * poem_split (:42-76) is replaced by a literal data frame, because it needs
#     tidytext (unnest_lines / unnest_sentences), which is not installed here.
#     poem_split only tokenises; it does not touch the emotion values.
#   * read.csv("www/nrc.csv") is replaced by a 4-row lexicon written by this
#     script, because the repo's copy of the NRC lexicon is not in the frozen
#     set.  The column names and the `sentiment` values are the ones the frozen
#     code queries.
#   * font_add_google / showtext (:25-26) are dropped (they need the network).
#
# Verification level: L-pixel (ggplot renders to PNG; the PNGs are hashed).

suppressPackageStartupMessages({
  library(dplyr); library(tidyr); library(data.table); library(ggplot2)
})

args <- commandArgs(trailingOnly = TRUE)
outdir <- if (length(args) >= 1) args[1] else "."
dir.create(outdir, showWarnings = FALSE, recursive = TRUE)

# ---- VERBATIM: app.R :29-40 ----
main_pal <- c("joy" = "#e9a53a",
              "trust" = "#071e2f",
              "surprise" = "#f09e9e",
              "anticipation" = "#c77849",
              "sadness" = "#467495",
              "fear" = "#60376b",
              "anger" = "#520a18",
              "disgust" = "#71de8b")

bg_col <- "#f7f7f5"
block_col <- "#d4d0cb"

# ---- a stand-in for www/nrc.csv (disclosed substitution) ----
nrc_path <- file.path(outdir, "nrc.csv")
write.csv(data.frame(
  word      = c("joyful", "joyful", "gloomy",  "wary", "cross", "cheer"),
  sentiment = c("joy",    "trust",  "sadness", "fear", "anger", "joy")
), nrc_path, row.names = FALSE)

# ---- VERBATIM: app.R :78-112, with the one read.csv path redirected ----
poem_long <- function(poem_split) {
  nrc_all <- read.csv(nrc_path)

  poem_sent <- poem_split %>%
    filter() %>%
    mutate(joy = as.numeric(word %in% nrc_all$word[nrc_all$sentiment == "joy"]),
           trust = as.numeric(word %in% nrc_all$word[nrc_all$sentiment == "trust"]),
           surprise = as.numeric(word %in% nrc_all$word[nrc_all$sentiment == "surprise"]),
           anticipation = as.numeric(word %in% nrc_all$word[nrc_all$sentiment == "anticipation"]),
           sadness = as.numeric(word %in% nrc_all$word[nrc_all$sentiment == "sadness"]),
           fear = as.numeric(word %in% nrc_all$word[nrc_all$sentiment == "fear"]),
           anger = as.numeric(word %in% nrc_all$word[nrc_all$sentiment == "anger"]),
           disgust = as.numeric(word %in% nrc_all$word[nrc_all$sentiment == "disgust"]),
           total = joy + trust + surprise + anticipation + sadness + fear + anger + disgust) %>%
    mutate(joy = joy / total,
           trust = trust / total,
           surprise = surprise / total,
           anticipation = anticipation / total,
           sadness = sadness / total,
           fear = fear / total,
           anger = anger / total,
           disgust = disgust / total,
           total = joy + trust + surprise + anticipation + sadness + fear + anger + disgust) %>%
    select(-total)

  # >>> the line under test, :106 <<<
  poem_sent[is.na(poem_sent)] <- 0

  poem_long <- melt(setDT(poem_sent), id.vars = c("line","line_id","word", "word_id"), variable.name = "emotion")

  return(poem_long)
}

# ---- VERBATIM: app.R :114-143 ----
poem_words <- function(poem_long) {
  poem_byword <- poem_long %>%
    group_by(line, line_id, emotion, word, word_id) %>%
    summarise(value = sum(value), .groups = "drop_last") %>%
    filter() %>%
    group_by(word) %>%
    mutate(test = value) %>%
    select(-line, -value) %>%
    pivot_wider(id_cols= c(line_id, word, word_id), names_from = emotion, values_from = test)

  poem_words <- poem_byword %>%
    arrange(line_id, word_id) %>%
    mutate(word_no_punc = gsub('[^A-Za-z0-9 ]', "", word),
           chars = nchar(word),
           words = nchar(gsub('[^ ]', "", word_no_punc)) + 1,
           punc = nchar(gsub('[A-Za-z0-9 \t\n\r\v\f]', "", word)),
           comma = nchar(gsub('[^,]', "", word)),
           question = nchar(gsub('[^?]', "", word)),
           exclaim = nchar(gsub('[^!]', "", word)),
           quote = nchar(gsub('[^"]', "", word))) %>%
    group_by(line_id) %>%
    mutate(char_sum = cumsum(chars))

  # >>> the second NA replacement, :141 <<<
  poem_words[is.na(poem_words)] <- 0

  return(poem_words)
}

# ---- VERBATIM: app.R :176-229 ----
plot_lines <- function(poem_words) {
  emotion_sum <- poem_words %>%
    mutate(x = 1) %>%
    group_by(x) %>%
    summarise(joy = sum(joy, na.rm = TRUE),
              trust = sum(trust, na.rm = TRUE),
              surprise = sum(surprise, na.rm = TRUE),
              anticipation = sum(anticipation, na.rm = TRUE),
              sadness = sum(sadness, na.rm = TRUE),
              fear = sum(fear, na.rm = TRUE),
              anger = sum(anger, na.rm = TRUE),
              disgust = sum(disgust, na.rm = TRUE)) %>%
    pivot_longer(-x, names_to = "emotion", values_to = "value") %>%
    arrange(-value, emotion) %>%
    head(3)

  pal <- main_pal[emotion_sum$emotion]

  emo_1 <- paste(emotion_sum$emotion[1])
  emo_2 <- paste(emotion_sum$emotion[2])
  emo_3 <- paste(emotion_sum$emotion[3])
  emo_1 <- as.name(emo_1)
  emo_2 <- as.name(emo_2)
  emo_3 <- as.name(emo_3)

  lines <- poem_words %>%
    mutate(line_id = as.numeric(line_id)) %>%
    ggplot(aes(x = line_id, y = chars)) +
    geom_col(data = poem_words %>% arrange(line_id, word_id), fill = block_col, color = bg_col) +
    geom_col(data = poem_words %>% arrange(line_id, word_id) %>% mutate(emo_1 = ifelse(is.na(!!emo_1) == TRUE, 0, !!emo_1)), aes(alpha = emo_1), fill = as.character(pal[as.character(emo_1)]), color = bg_col) +
    geom_col(data = poem_words %>% arrange(line_id, word_id) %>% mutate(emo_2 = ifelse(is.na(!!emo_2) == TRUE, 0, !!emo_2)), aes(alpha = emo_2), fill = as.character(pal[as.character(emo_2)]), color = bg_col) +
    geom_col(data = poem_words %>% arrange(line_id, word_id) %>% mutate(emo_3 = ifelse(is.na(!!emo_3) == TRUE, 0, !!emo_3)), aes(alpha = emo_3), fill = as.character(pal[as.character(emo_3)]), color = bg_col) +
    scale_alpha(range = c(0, 1)) +
    scale_x_reverse() +
    scale_y_reverse() +
    coord_flip() +
    theme_minimal() +
    theme(axis.title = element_blank(),
          axis.text = element_blank(),
          panel.grid = element_blank(),
          panel.background = element_rect(color = bg_col, fill = bg_col),
          plot.background = element_rect(colour = bg_col, fill = bg_col),
          legend.position = "none",
          plot.margin=unit(c(0.1,0.1,0.1,-0.5), "cm"),
          plot.caption = element_text(size = 10, color = "#1d1d1d")
    )

  return(lines)
}
# ---------------------------- end verbatim ----------------------------

# poem_split() stand-in: one line, four words.  Word 3 is the variable of
# interest; words 1, 2 and 4 are held fixed across the two states.
make_split <- function(w3) {
  data.frame(line = "joyful joyful X wary",
             line_id = 1L,
             word = c("joyful", "joyful", w3, "wary"),
             word_id = 1:4,
             stringsAsFactors = FALSE)
}

render <- function(tag, w3) {
  pw <- poem_words(poem_long(make_split(w3)))
  p  <- plot_lines(pw)
  f  <- file.path(outdir, paste0("S1-09_", tag, ".png"))
  ggsave(f, p, width = 4, height = 3, dpi = 100, bg = bg_col)
  h <- tools::md5sum(f)[[1]]
  row <- pw[pw$word == w3, c("word", "joy", "trust", "sadness", "fear")]
  cat(sprintf("  [%s] word3=%-8s joy=%s trust=%s sadness=%s fear=%s  md5=%s\n",
              tag, w3, row$joy, row$trust, row$sadness, row$fear, h))
  h
}

cat(R.version.string, "| ggplot2", as.character(packageVersion("ggplot2")), "\n")
cat("\n== S1-09 rendered plots ==\n")
# state A: word 3 is not in the lexicon at all -> total = 0 -> NaN -> 0
A <- render("A_word_not_in_lexicon", "zzz")
# state B: word 3 IS in the lexicon, but scores 0 on the displayed emotions
B <- render("B_word_in_lexicon_score0", "gloomy")
# control: word 3 carries the displayed emotion
C <- render("C_control_carries_joy", "joyful")

cat("\n== pre-registered comparison ==\n")
cat(sprintf("  not-in-lexicon vs in-lexicon-but-0 : %s (predicted identical) => %s\n",
            if (A == B) "identical" else "different",
            if (A == B) "MATCH" else "MISMATCH"))
cat(sprintf("  CONTROL word carries the emotion   : %s (predicted different) => %s\n",
            if (A == C) "identical" else "different",
            if (A != C) "MATCH" else "MISMATCH"))

cat("\n== is the :211 ifelse ever the thing that does the replacement? ==\n")
pw <- poem_words(poem_long(make_split("zzz")))
cat("  after :141, any NA left in poem_words:", any(is.na(pw)), "\n")
cat("  (if FALSE, the NA->0 substitution has already happened at :106/:141 and\n")
cat("   the ifelse at :211-213 is a second, redundant guard.)\n")

# ============================================================================
# POST-HOC test, added AFTER the pre-registered comparison came out MISMATCH.
# Rationale and design are frozen in logs/S1-09_mismatch_diagnosis.md, which was
# written before this block was run.  This does NOT replace the result above.
#
# Swap two same-length words inside the SAME poem.  Sums are position
# independent, so the set of displayed emotions cannot move; only the per-word
# alpha can.  If the two words render identically, the figure is unchanged.
# ============================================================================
make_split8 <- function(w7, w8) {
  ws <- c("joyful","joyful","joyful","joyful","gloomy","gloomy", w7, w8)
  data.frame(line = paste(ws, collapse = " "), line_id = 1L,
             word = ws, word_id = 1:8, stringsAsFactors = FALSE)
}
render8 <- function(tag, w7, w8) {
  pw <- poem_words(poem_long(make_split8(w7, w8)))
  p  <- plot_lines(pw)
  f  <- file.path(outdir, paste0("S1-09_posthoc_", tag, ".png"))
  ggsave(f, p, width = 4, height = 3, dpi = 100, bg = bg_col)
  cat(sprintf("  [%s] words 7,8 = %s , %s   md5=%s\n", tag, w7, w8, tools::md5sum(f)[[1]]))
  tools::md5sum(f)[[1]]
}
cat("\n== POST-HOC: swap two same-length words inside one poem ==\n")
cat("   'zzzzz' is absent from the lexicon (0/0 = NaN -> 0 at :106/:141)\n")
cat("   'cross' IS in the lexicon (anger = 1) but anger is not among the three displayed emotions\n")
P1 <- render8("P1_zzzzz_then_cross", "zzzzz", "cross")
P2 <- render8("P2_cross_then_zzzzz", "cross", "zzzzz")
cat(sprintf("  swap of (unmeasurable, measured-but-not-displayed) : %s (predicted identical) => %s\n",
            if (P1 == P2) "identical" else "different", if (P1 == P2) "MATCH" else "MISMATCH"))
cat("\n   control: 'cheer' IS in the lexicon and carries joy, which IS displayed\n")
Q1 <- render8("Q1_zzzzz_then_cheer", "zzzzz", "cheer")
Q2 <- render8("Q2_cheer_then_zzzzz", "cheer", "zzzzz")
cat(sprintf("  CONTROL swap of (unmeasurable, measured-and-displayed) : %s (predicted different) => %s\n",
            if (Q1 == Q2) "identical" else "different", if (Q1 != Q2) "MATCH" else "MISMATCH"))

cat("\n== the alpha values ggplot actually assigned (ggplot_build) ==\n")
pw <- poem_words(poem_long(make_split8("zzzzz", "cross")))
b <- ggplot_build(plot_lines(pw))
for (L in 2:4) {
  a <- b$data[[L]]$alpha
  cat(sprintf("  overlay layer %d alpha by word position: %s\n", L - 1, paste(sprintf("%.2f", a), collapse = " ")))
}
cat("  word positions 7 and 8 are 'zzzzz' (unmeasurable) and 'cross' (anger=1).\n")
