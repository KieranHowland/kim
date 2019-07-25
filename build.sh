BLACKLIST=(
  "build/"
  "errors/"
  "node_modules/"
  "uploads/"
  ".git/"
  "./build.sh"
  "./LICENSE"
  "./README.md"
  "./.gitignore"
)

if [ ! -d "./build" ]
then
  mkdir ./build
else
  rm -r ./build
  mkdir ./build
fi

for DIR in */ ;
do
  if [ -d ${DIR} ] ; then
    if [[ ! " ${BLACKLIST[*]} " == *"${DIR}"* ]] ; then
      cp -r ${DIR} ./build/${DIR}
    fi
  fi
done

for FILE in ./*
do
  if [ ! -d ${FILE} ] ; then
    if [[ ! " ${BLACKLIST[*]} " == *"${FILE}"* ]] ; then
      cp ${FILE} ./build/${FILE}
    fi
  fi
done
