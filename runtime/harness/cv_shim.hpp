// Minimal recording shim for the OpenCV types/entry points used by
// EmotionBarVisualizer::draw.  NOT part of the frozen artefact.
// Every draw call is emitted as one line of JSON on stdout so that the exact
// geometry computed by the ORIGINAL C++ source can be replayed through the real
// OpenCV (python bindings) in replay_C-02.py.
#pragma once
#include <cstdio>
#include <string>
#include <vector>
#include <map>
#include <algorithm>

namespace cv {

struct Point { int x = 0, y = 0; Point() {} Point(int x_, int y_) : x(x_), y(y_) {} };
struct Size  { int width = 0, height = 0; Size() {} Size(int w, int h) : width(w), height(h) {} };
struct Rect  { int x = 0, y = 0, width = 0, height = 0;
               Rect() {} Rect(int x_, int y_, int w, int h) : x(x_), y(y_), width(w), height(h) {} };
struct Scalar { double v0, v1, v2, v3;
                Scalar(double a = 0, double b = 0, double c = 0, double d = 0) : v0(a), v1(b), v2(c), v3(d) {} };
struct Mat { int rows = 0, cols = 0;
             Mat() {} Mat(int r, int c) : rows(r), cols(c) {}
             Mat operator()(const Rect& r) const { return Mat(r.height, r.width); } };

const int FILLED = -1;
const int FONT_HERSHEY_COMPLEX_SMALL = 5;

// textSize/baseline are the values the real OpenCV 4.13.0 returns for the
// longest emotion label ("surprise") at FONT_HERSHEY_COMPLEX_SMALL, scale 1,
// thickness 1 -- measured with cv2.getTextSize and injected here so that the
// geometry the original code computes is the real geometry.
inline Size getTextSize(const std::string& text, int, double, int, int* baseLine) {
    (void)text;
    *baseLine = 6;
    return Size(106, 14);
}

inline void addWeighted(const Mat& src1, double a, const Scalar& s, double b, double g, Mat& dst) {
    (void)src1; (void)dst;
    std::printf("{\"op\":\"addWeighted\",\"alpha\":%g,\"beta\":%g,\"gamma\":%g,"
                "\"scalar\":[%g,%g,%g,%g]}\n", a, b, g, s.v0, s.v1, s.v2, s.v3);
}

inline void putText(Mat&, const std::string& text, const Point& org, int font, double scale,
                    const Scalar& color, int thickness) {
    std::printf("{\"op\":\"putText\",\"text\":\"%s\",\"org\":[%d,%d],\"font\":%d,\"scale\":%g,"
                "\"color\":[%g,%g,%g],\"thickness\":%d}\n",
                text.c_str(), org.x, org.y, font, scale, color.v0, color.v1, color.v2, thickness);
}

inline void rectangle(Mat&, const Rect& r, const Scalar& color, int thickness) {
    std::printf("{\"op\":\"rectangle\",\"rect\":[%d,%d,%d,%d],\"color\":[%g,%g,%g],\"thickness\":%d}\n",
                r.x, r.y, r.width, r.height, color.v0, color.v1, color.v2, thickness);
}

}  // namespace cv
