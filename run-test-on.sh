for i in {1..100}; do
	curl https://us-central1-blidd-experiments.cloudfunctions.net/v1preferresttrue; 
	sleep 1;
done
