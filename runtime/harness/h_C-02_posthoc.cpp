// POST-HOC sweep for C-02, written AFTER the pre-registered run.
// Identical to h_C-02.cpp except for the case list in main(): it sweeps the
// measured value of `surprise` across the boundary where the filled bar first
// becomes wider than the outline it sits on.
// Runtime check for C-02 (openvinotoolkit/open_model_zoo,
// demos/interactive_face_detection_demo/cpp/visualizer.cpp, sha256 eee2568b...)
//
// Static prediction (16_判定_第1層OSS):
//   `emotions[emotionNames[i]]` is std::map::operator[] on a by-value, non-const
//   map, so a label present in the DISPLAY vocabulary but absent from the
//   upstream result is default-constructed to 0.0f and drawn as a zero-width
//   bar -- indistinguishable from a value measured at 0.0.
//
// The constructor and draw() below are copied VERBATIM from the frozen file
// (lines 16-51).  Only the cv:: back end is a recording shim (cv_shim.hpp);
// the geometry is then replayed through the real OpenCV in replay_C-02.py.
#include "cv_shim.hpp"
#include <cstdio>
#include <map>
#include <string>
#include <vector>
#include <algorithm>

class EmotionBarVisualizer {
public:
    explicit EmotionBarVisualizer(std::vector<std::string> const& emotionNames,
                                  cv::Size size = cv::Size(300, 140),
                                  cv::Size padding = cv::Size(10, 10),
                                  double opacity = 0.6, double textScale = 1, int textThickness = 1);
    void draw(cv::Mat& img, std::map<std::string, float> emotions, cv::Point org,
              cv::Scalar fgcolor, cv::Scalar bgcolor);
    cv::Size getSize();
private:
    std::vector<std::string> emotionNames;
    cv::Size size, padding, textSize;
    int textBaseline;
    int ystep;
    double opacity, textScale;
    int textThickness;
};

// ==================== VERBATIM: frozen visualizer.cpp :16-26 ====================
EmotionBarVisualizer::EmotionBarVisualizer(std::vector<std::string> const& emotionNames, cv::Size size, cv::Size padding,
                                     double opacity, double textScale, int textThickness):
                                     emotionNames(emotionNames), size(size), padding(padding),
                                     opacity(opacity), textScale(textScale), textThickness(textThickness)
{
    auto itMax = std::max_element(emotionNames.begin(), emotionNames.end(), [] (std::string const& lhs, std::string const& rhs) {
        return lhs.length() < rhs.length();
    });

    textSize = cv::getTextSize(*itMax, cv::FONT_HERSHEY_COMPLEX_SMALL, textScale, textThickness, &textBaseline);
    ystep = (emotionNames.size() < 2) ? 0 : (size.height - 2 * padding.height - textSize.height) / (emotionNames.size() - 1);
}

cv::Size EmotionBarVisualizer::getSize() {
    return size;
}

// ==================== VERBATIM: frozen visualizer.cpp :33-51 ====================
void EmotionBarVisualizer::draw(cv::Mat& img, std::map<std::string, float> emotions, cv::Point org, cv::Scalar fgcolor, cv::Scalar bgcolor) {
    cv::Mat tmp = img(cv::Rect(org.x, org.y, size.width, size.height));
    cv::addWeighted(tmp, 1.f - opacity, bgcolor, opacity, 0, tmp);

    auto drawEmotion = [&](int n, std::string text, float value) {
        cv::Point torg(org.x + padding.width, org.y + n * ystep + textSize.height + padding.height);

        int textWidth = textSize.width + 10;
        cv::Rect r(torg.x + textWidth, torg.y - textSize.height, size.width - 2 * padding.width - textWidth, textSize.height + textBaseline / 2);

        cv::putText(img, text, torg, cv::FONT_HERSHEY_COMPLEX_SMALL, textScale, fgcolor, textThickness);
        cv::rectangle(img, r, fgcolor, 1);
        r.width = static_cast<int>(r.width * value);
        cv::rectangle(img, r, fgcolor, cv::FILLED);
    };

    for (size_t i = 0; i< emotionNames.size(); i++) {
        drawEmotion(i, emotionNames[i], emotions[emotionNames[i]]);
    }
}
// ================================ end verbatim ================================

// emotionsVec as declared in detectors.hpp:109 of the same demo.
static const std::vector<std::string> emotionsVec = {"neutral", "happy", "sad", "surprise", "anger"};

static void run(const char* label, std::map<std::string, float> emotions) {
    EmotionBarVisualizer vis(emotionsVec);
    cv::Mat img(480, 640);
    std::fprintf(stderr, "[%s] map before draw: size=%zu keys=", label, emotions.size());
    for (auto& kv : emotions) std::fprintf(stderr, "%s(%g) ", kv.first.c_str(), (double)kv.second);
    std::fprintf(stderr, "\n");

    std::printf("### CASE %s\n", label);
    vis.draw(img, emotions, cv::Point(0, 0), cv::Scalar(255, 255, 255), cv::Scalar(0, 0, 255));

    std::fprintf(stderr, "[%s] map after draw (caller's copy is by value, so this is the copy): unchanged size=%zu\n",
                 label, emotions.size());
}

// Same as run(), but keeps a reference so we can watch operator[] insert.
static void probe_insertion() {
    std::map<std::string, float> m;
    m["happy"] = 0.9f;
    std::fprintf(stderr, "[probe] before: size=%zu, contains 'anger'=%d\n", m.size(), (int)m.count("anger"));
    float v = m["anger"];               // exactly the expression at :50
    std::fprintf(stderr, "[probe] m[\"anger\"] returned %g\n", (double)v);
    std::fprintf(stderr, "[probe] after: size=%zu, contains 'anger'=%d\n", m.size(), (int)m.count("anger"));
}

int main() {
    // reference: the same "missing key" state as the pre-registered run
    run("A_missing", {{"neutral", 0.10f}, {"happy", 0.90f}, {"sad", 0.00f}});
    // sweep: surprise measured at increasing non-zero values
    const float vs[] = {0.0000f, 0.0030f, 0.0060f, 0.0061f, 0.0100f, 0.0121f, 0.0122f, 0.0200f};
    char buf[64];
    for (float v : vs) {
        std::snprintf(buf, sizeof(buf), "surprise_%.4f", v);
        run(buf, {{"neutral", 0.10f}, {"happy", 0.90f}, {"sad", 0.00f},
                  {"surprise", v}, {"anger", 0.0f}});
    }
    return 0;
}
