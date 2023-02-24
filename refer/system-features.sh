fn="n2f-map.txt"
rm -rf $fn
touch $fn
for entry in $(ls *.json); do
  n=$(echo ${entry%.*} | tr '[:lower:]' '[:upper:]')
  f=$(grep '"' $entry | sed 's/ //g; s/"[,]*//g' | xargs)
  echo "$n: $f" >> $fn
done