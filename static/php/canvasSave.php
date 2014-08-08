<?php
if (isset($GLOBALS["HTTP_RAW_POST_DATA"])) {
$imageData=$GLOBALS['HTTP_RAW_POST_DATA'];
$filteredData=substr($imageData, strpos($imageData, ",")+1);
$unencodedData=base64_decode($filteredData);
$fp = uniqid(shareroot_).".jpg";
echo($fp);
file_put_contents($fp, $unencodedData);
$overlay = imagecreatefrompng($fp);
imagealphablending($overlay, true);
imagesavealpha($overlay, true);
//Save the image to a file
imagepng($overlay, $fp);
}
?>