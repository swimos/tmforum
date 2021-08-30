package swim.cellular.edx;

import swim.codec.Utf8;
import swim.json.Json;
import swim.structure.Item;
import swim.structure.Value;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

public class EDXApi {

  private static final String POINT_STUDY_URL = "https://tmforum-staging-api.edx.com/cse/study/ea8123b9-8a5c-f7df-90f0-91a2f7bc4f2f/point?lat=%s&lon=%s";
  private static final String API_KEY = "ayETVg/dGTkrJQorJ6k09qATdhwDEfGoauqKRnP/CbxtEjGOuCDrNA==";

  public static Value pointStudy(double lat, double lon) {
    final String url = String.format(POINT_STUDY_URL, Double.toString(lat), Double.toString(lon));
    return get(url);
  }

  private static Value get(String urlStr) {
    final HttpURLConnection urlConnection;
    try {
      final URL url = new URL(urlStr);
      urlConnection = (HttpURLConnection) url.openConnection();
      urlConnection.setRequestProperty("Accept", "application/json");
      urlConnection.setRequestProperty("x-functions-key", API_KEY);
      return Utf8.read(Json.structureParser().valueParser(), urlConnection.getInputStream());
    } catch (Throwable e) {
      e.printStackTrace();
    }
    return Value.absent();
  }

  public static void main(String[] args) {
    Value record = pointStudy(37.74731, -122.38634);
    Value results = record.get("results");
    Iterator<Item> iterator = results.iterator();
    while (iterator.hasNext()) {
      Item item = iterator.next();
      System.out.println(item.get("name").stringValue());
      System.out.println(item.get("value").numberValue());
    }
  }

}
