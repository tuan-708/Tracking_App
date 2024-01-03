// export let listPosition: any[] = [{ "latitude": 21.010332, "longitude": 105.788075, "icon": "gps", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.010155, "longitude": 105.788242, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.009542, "longitude": 105.788684, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.008952, "longitude": 105.78929, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.008364, "longitude": 105.789702, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.007823, "longitude": 105.790157, "icon": "camera", "timestamp": 1703651136535, "title": "", "uri": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7ocUXvHiuY-8Nm7heg7t-7t4X-fzBq7zkWnzNDNV5ww&s" }, { "latitude": 21.007955, "longitude": 105.790446, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.00818, "longitude": 105.790782, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.008373, "longitude": 105.791058, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.008703, "longitude": 105.791506, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.009094, "longitude": 105.791206, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.009534, "longitude": 105.790852, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.009952, "longitude": 105.790522, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.010375, "longitude": 105.79018, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.010001, "longitude": 105.789638, "icon": "current", "timestamp": 1703651136535, "title": "", "uri": "" }, { "latitude": 21.009523, "longitude": 105.788949, "icon": "stop", "timestamp": 1703651136535, "title": "", "uri": "" }]

// export const listPosition = [{"27/12/2023 11:25:20":[{"latitude":21.010332,"longitude":105.788075,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.010155,"longitude":105.788242,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.009542,"longitude":105.788684,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.008952,"longitude":105.789290,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.008364, "longitude":105.789702,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.007823,"longitude":105.790157,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.007955,"longitude":105.790446,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.008180,"longitude":105.790782,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.008373,"longitude":105.791058,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.008703,"longitude":105.791506,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.009094,"longitude":105.791206,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.009534,"longitude":105.790852,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.009952,"longitude":105.790522,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.010375,"longitude":105.790180,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.010001,"longitude":105.789638,"icon":"gps","timestamp":1703651136535,"title":""},{"latitude":21.009523,"longitude":105.788949,"icon":"gps","timestamp":1703651136535,"title":""}]}]
import { Platform } from "react-native";
export let listPosition: any[] = [];

const includeExtra = true;

interface Action {
  title: string;
  type: "capture" | "library";
  options: ImagePickerResponse.CameraOptions | ImagePicker.ImageLibraryOptions;
}

export const actions: Action[] = [
  {
    title: "Chụp ảnh mới",
    type: "capture",
    options: {
      mediaType: "photo",
      includeExtra,
    },
  },
//   {
//     title: "Select Image",
//     type: "library",
//     options: {
//       selectionLimit: 0,
//       mediaType: "photo",
//       includeBase64: false,
//       includeExtra,
//     },
//   },
//   {
//     title: "Take Video",
//     type: "capture",
//     options: {
//       saveToPhotos: true,
//       formatAsMp4: true,
//       mediaType: "video",
//       includeExtra,
//     },
//   },
//   {
//     title: "Select Video",
//     type: "library",
//     options: {
//       selectionLimit: 0,
//       mediaType: "video",
//       formatAsMp4: true,
//       includeExtra,
//     },
//   },
//   {
//     title: "Select Image or Video\n(mixed)",
//     type: "library",
//     options: {
//       selectionLimit: 0,
//       mediaType: "mixed",
//       includeExtra,
//     },
//   },
];

if (Platform.OS === "ios") {
  actions.push({
    title: "Take Image or Video\n(mixed)",
    type: "capture",
    options: {
      saveToPhotos: true,
      mediaType: "mixed",
      includeExtra,
      presentationStyle: "fullScreen",
    },
  });
}
