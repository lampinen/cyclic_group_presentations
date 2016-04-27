#!/bin/bash
i=1
for f in data_subject_*.json
do
	mv $f data_subject_${i}.json 
	i=$((i+1))
done
