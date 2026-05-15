import cv2
import numpy as np


def is_pentacam_image(image_path):

    img = cv2.imread(image_path)

    if img is None:
        return False

    # Resize image
    img = cv2.resize(img, (512, 512))

    # Convert grayscale
    gray = cv2.cvtColor(
        img,
        cv2.COLOR_BGR2GRAY
    )

    # =====================================================
    # DETECT CIRCULAR CORNEAL MAP
    # =====================================================

    circles = cv2.HoughCircles(

        gray,

        cv2.HOUGH_GRADIENT,

        dp=1.2,

        minDist=80,

        param1=50,

        param2=20,

        minRadius=60,

        maxRadius=240
    )

    # If no circle found
    if circles is None:
        return False

    # =====================================================
    # HEATMAP COLOR CHECK
    # =====================================================

    hsv = cv2.cvtColor(
        img,
        cv2.COLOR_BGR2HSV
    )

    blue = cv2.inRange(
        hsv,
        (90, 40, 40),
        (130, 255, 255)
    )

    green = cv2.inRange(
        hsv,
        (35, 30, 30),
        (85, 255, 255)
    )

    yellow = cv2.inRange(
        hsv,
        (20, 80, 80),
        (35, 255, 255)
    )

    red1 = cv2.inRange(
        hsv,
        (0, 80, 80),
        (10, 255, 255)
    )

    red2 = cv2.inRange(
        hsv,
        (160, 80, 80),
        (179, 255, 255)
    )

    red = red1 + red2

    total_heatmap_pixels = (

        np.sum(blue > 0) +
        np.sum(green > 0) +
        np.sum(yellow > 0) +
        np.sum(red > 0)
    )

    # Less strict threshold
    if total_heatmap_pixels < 8000:
        return False

    # =====================================================
    # VALID IMAGE
    # =====================================================

    return True