package jp.rouh.shougi.img;

import javax.imageio.ImageIO;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.util.List;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.stream.IntStream;

public final class PieceImageGenerator {

    public static BufferedImage createPieceImage(int width, int height, int innerWidth, int innerHeight, String text, Color textColor){
        var image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        var top = new Point(width/2, 0);
        var leftTop = new Point((width - innerWidth)/2, height - innerHeight);
        var rightTop = new Point((width - innerWidth)/2 + innerWidth, height - innerHeight);
        var leftBottom = new Point(0, height);
        var rightBottom = new Point(width, height);
        var xs = new int[]{top.x, rightTop.x, rightBottom.x, leftBottom.x, leftTop.x};
        var ys = new int[]{top.y, rightTop.y, rightBottom.y, leftBottom.y, leftTop.y};
        var g2 = image.createGraphics();
        g2.setColor(new Color(222, 184, 135));
        g2.fillPolygon(new Polygon(xs, ys, 5));
        g2.setColor(Color.BLACK);
        int strokeSize = 5;
        g2.setStroke(new BasicStroke(strokeSize));
        g2.drawLine(top.x, top.y, leftTop.x, leftTop.y);
        g2.drawLine(top.x, top.y, rightTop.x, rightTop.y);
        g2.drawLine(leftTop.x, leftTop.y, leftBottom.x, leftBottom.y);
        g2.drawLine(rightTop.x, rightTop.y, rightBottom.x, rightBottom.y);
        g2.drawLine(leftBottom.x, leftBottom.y - strokeSize/2, rightBottom.x, rightBottom.y - strokeSize/2);

        var textImage = resize(innerWidth, innerHeight, marginBottom(innerHeight/20 , marginAround(innerHeight/30, createTextImage(text, innerWidth, innerHeight, innerHeight/60, textColor))));
        g2.setColor(Color.BLACK);
        g2.drawImage(textImage, leftTop.x, leftTop.y, innerWidth, innerHeight, null);
        g2.dispose();
        return image;
    }

    private static BufferedImage createTextImage(char c, int size, Color textColor){
        var dummyImage = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);
        var dg2 = dummyImage.createGraphics();
        var font = new Font("游明朝", Font.BOLD, size);
        dg2.setFont(font);
        var width = dg2.getFontMetrics().stringWidth(String.valueOf(c));
        var height = dg2.getFontMetrics().getHeight();
        var ascent = dg2.getFontMetrics().getAscent();
        dg2.dispose();
        var image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        var g2 = image.createGraphics();
        g2.setFont(font);
        g2.setColor(textColor);
        g2.drawString(String.valueOf(c), 0, ascent);
        g2.dispose();
        return image;
    }

    private static BufferedImage createTextImage(String s, int width, int height, int margin, Color textColor) {
        return concatVer(IntStream.range(0, s.length()).mapToObj(i ->
                marginVer(margin, resize(width, height, trimVer(createTextImage(s.charAt(i), width, textColor))))).toList());
    }

    /**
     * 複数画像
     */
    private static BufferedImage concatVer(List<BufferedImage> images) {
        if (images.isEmpty()) throw new IllegalArgumentException();
        var width = images.stream().mapToInt(BufferedImage::getWidth).max().orElseThrow();
        var height = images.stream().mapToInt(BufferedImage::getHeight).sum();
        var result = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        var g2 = result.createGraphics();
        int currentHeight = 0;
        for (var image:images){
            g2.drawImage(image, 0, currentHeight, image.getWidth(), image.getHeight(), null);
            currentHeight += image.getHeight();
        }
        g2.dispose();
        return result;
    }

    /**
     * 画像の上下左右に指定の透明の余白を追加します。
     */
    private static BufferedImage marginAround(int size, BufferedImage orig) {
        var image = new BufferedImage(orig.getWidth() + size*2, orig.getHeight() + size*2, BufferedImage.TYPE_INT_ARGB);
        var g2 = image.createGraphics();
        g2.drawImage(orig, size, size, orig.getWidth(), orig.getHeight(), null);
        g2.dispose();
        return image;
    }

    /**
     * 画像の上下に指定の透明の余白を追加します。
     */
    private static BufferedImage marginVer(int size, BufferedImage orig){
        var image = new BufferedImage(orig.getWidth(), orig.getHeight() + size*2, BufferedImage.TYPE_INT_ARGB);
        var g2 = image.createGraphics();
        g2.drawImage(orig, 0, size, orig.getWidth(), orig.getHeight(), null);
        g2.dispose();
        return image;
    }

    /**
     * 画像の下に指定の透明の余白を追加します。
     */
    private static BufferedImage marginBottom(int size, BufferedImage orig){
        var image = new BufferedImage(orig.getWidth(), orig.getHeight() + size, BufferedImage.TYPE_INT_ARGB);
        var g2 = image.createGraphics();
        g2.drawImage(orig, 0, 0, orig.getWidth(), orig.getHeight(), null);
        g2.dispose();
        return image;
    }

    /**
     * 画像の上下の透明の余白部分を削除します。
     */
    private static BufferedImage trimVer(BufferedImage orig) {
        int from = 0;
        search: for (int y = 0; y<orig.getHeight(); y++){
            for (int x = 0; x<orig.getWidth(); x++){
                if ((orig.getRGB(x, y) >> 24) != 0x00) {
                    // not transparent
                    from = y;
                    break search;
                }
            }
        }
        int to = orig.getHeight() - 1;
        search: for (int y = orig.getHeight() - 1; y>=0; y--){
            for (int x = 0; x<orig.getWidth(); x++){
                if ((orig.getRGB(x, y) >> 24) != 0x00) {
                    // not transparent
                    to = y;
                    break search;
                }
            }
        }
        int height = to - from;
        var image = new BufferedImage(orig.getWidth(), height, BufferedImage.TYPE_INT_ARGB);
        var g2 = image.createGraphics();
        g2.drawImage(orig, 0, 0, orig.getWidth(), height, 0, from, orig.getWidth(), to, null);
        g2.dispose();
        return image;
    }

    /**
     * 画像の高さを縮小拡大してリサイズします。
     */
    private static BufferedImage resize(int width, int height, BufferedImage orig) {
        var result = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        var image = orig.getScaledInstance(width, height, Image.SCALE_DEFAULT);
        var g2 = result.createGraphics();
        g2.drawImage(image, 0, 0, null);
        g2.dispose();
        return result;
    }

    /**
     * 固定サイズの画像として、拡大率がそのままの元の画像を中央に配置します。
     */
    private static BufferedImage frame(int width, int height, BufferedImage orig){
        if(width < orig.getWidth() || height < orig.getHeight()){
            throw new IllegalArgumentException();
        }
        int marginX = (width - orig.getWidth())/2;
        int marginY = (height - orig.getHeight())/2;
        var image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        var g2 = image.createGraphics();
        g2.drawImage(orig, marginX, marginY, null);
        g2.dispose();
        return image;
    }

    /**
     * 上下反転します。
     */
    static BufferedImage upSideDown(BufferedImage orig){
        int width = orig.getWidth();
        int height = orig.getHeight();
        var image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        var at = new AffineTransform();
        at.rotate(Math.toRadians(180), width/2d, height/2d);
        var op = new AffineTransformOp(at, AffineTransformOp.TYPE_BICUBIC);
        op.filter(orig, image);
        return image;
    }

    private static void saveImage(String name, BufferedImage image){
        try {
            ImageIO.write(image, "png", new File("out/img/"+name+".png"));
        }catch (IOException e){
            throw new RuntimeException(e);
        }
    }

    private enum PieceBlueprint{
        HIGHER_KING("王将", "王", 28, 31, false),
        LOWER_KING("玉将", "玉", 28, 31, false),
        ROOK("飛車", "飛", 27, 30, false),
        BISHOP("角行", "角", 27, 30, false),
        GOLD("金将", "金", 26, 29, false),
        SILVER("銀将", "銀", 26, 29, false),
        KNIGHT("桂馬", "桂", 25, 28, false),
        LANCE("香車", "香", 23, 28, false),
        PAWN("歩兵", "歩", 22, 27, false),
        PROMOTED_ROOK("竜王", "竜", 27, 30, true),
        PROMOTED_BISHOP("竜馬", "馬", 27, 30, true),
        PROMOTED_SILVER("成銀", "全", 26, 29, true),
        PROMOTED_KNIGHT("成桂", "圭", 25, 28, true),
        PROMOTED_LANCE("成香", "杏", 23, 28, true),
        PROMOTED_PAWN("と金", "と", 22, 27, true),
        ;
        private final String fullText;
        private final String singleText;
        private final int width;
        private final int height;
        private final boolean promoted;
        PieceBlueprint(String fullText, String singleText, int width, int height, boolean promoted){
            this.fullText = fullText;
            this.singleText = singleText;
            this.width = width;
            this.height = height;
            this.promoted = promoted;
        }
    }

    public static void main(String[] args){
        int multiplier = 10;
        int frameWidth = 32*multiplier;
        int frameHeight = 32*multiplier;
        for (var piece:PieceBlueprint.values()){
            int width = piece.width*multiplier;
            int height = piece.height*multiplier;
            int innerWidth = (int)(width*0.75);
            int innerHeight = (int)(height*0.8);
            var color = piece.promoted? new Color(139, 0,0):Color.BLACK;
            var fullTextPieceImage = createPieceImage(width, height, innerWidth, innerHeight, piece.fullText, color);
            var singleTextPieceImage = createPieceImage(width, height, innerWidth, innerHeight, piece.singleText, color);
            saveImage("full/s_" + piece.name().toLowerCase(), frame(frameWidth, frameHeight, fullTextPieceImage));
            saveImage("single/s_" + piece.name().toLowerCase(), frame(frameWidth, frameHeight, singleTextPieceImage));

            var reveredFullTextPieceImage = upSideDown(fullTextPieceImage);
            var reveredSingleTextPieceImage = upSideDown(singleTextPieceImage);
            saveImage("full/r_" + piece.name().toLowerCase(), frame(frameWidth, frameHeight, reveredFullTextPieceImage));
            saveImage("single/r_" + piece.name().toLowerCase(), frame(frameWidth, frameHeight, reveredSingleTextPieceImage));
        }
    }
}
