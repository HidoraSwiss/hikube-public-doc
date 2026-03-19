---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Redis

### Data loss after restart

**Cause**: the `storageClass` used is `local`, which means data is stored only on the physical node where the pod was running. If the pod is rescheduled on another node, the previous data is lost.

**Solution**:

1. Check the `storageClass` being used:
   ```bash
   kubectl get pvc -l app=redis-<name>
   ```
2. To ensure data durability, use `storageClass: replicated`:
   ```yaml title="redis.yaml"
   spec:
     storageClass: replicated
   ```
3. Apply the change. Note that changing `storageClass` typically requires recreating the PVCs.
4. Also ensure that `replicas` >= 3 to benefit from Redis Sentinel replication.

### Redis Sentinel not converging

**Cause**: the number of replicas is even or less than 3, which prevents the Sentinel quorum from working correctly. Sentinel requires a majority to elect a new primary.

**Solution**:

1. Check the number of replicas:
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Make sure to use an **odd** number >= 3:
   ```yaml title="redis.yaml"
   spec:
     replicas: 3    # Or 5, never 2 or 4
   ```
3. Check the Sentinel logs to identify convergence issues:
   ```bash
   kubectl logs -l app=rfs-redis-<name>
   ```
4. Verify network connectivity between Redis pods. DNS or network issues can prevent node discovery.

### Memory saturated (OOMKilled)

**Cause**: the Redis dataset exceeds the memory allocated to the container. Kubernetes kills the pod when it exceeds its memory limit.

**Solution**:

1. Check if the pod was killed due to OOM:
   ```bash
   kubectl describe pod rfr-redis-<name>-0 | grep -i oom
   ```
2. Increase the allocated memory via `resources.memory` or a higher `resourcesPreset`:
   ```yaml title="redis.yaml"
   spec:
     resources:
       cpu: 1000m
       memory: 2Gi    # Increase memory
   ```
3. Check the Redis eviction policy (`maxmemory-policy`). By default, Redis returns an error when memory is full. Consider using `allkeys-lru` if Redis is used as a cache.
4. Monitor the dataset size:
   ```bash
   redis-cli -h rfr-redis-<name> -p 6379 -a <password> INFO memory
   ```

### Connection timeout

**Cause**: Redis pods are not running, service endpoints are empty, or the client-side authentication configuration does not match the server configuration.

**Solution**:

1. Check that pods are in `Running` state:
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Check that services have endpoints:
   ```bash
   kubectl get endpoints rfr-redis-<name>
   kubectl get endpoints rfs-redis-<name>
   ```
3. If `authEnabled: true`, make sure your client provides the correct password.
4. Test the connection from a debug pod:
   ```bash
   kubectl run test-redis --rm -it --image=redis:7 -- redis-cli -h rfr-redis-<name> -p 6379 -a <password> PING
   ```

### Authentication fails

**Cause**: the password used does not match the one stored in the Kubernetes Secret, or `authEnabled` is not enabled on the server while the client sends a password (or vice versa).

**Solution**:

1. Get the correct password from the Secret:
   ```bash
   kubectl get secret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
2. Verify that `authEnabled: true` is configured in your manifest:
   ```yaml title="redis.yaml"
   spec:
     authEnabled: true
   ```
3. Make sure your client uses exactly the password retrieved in step 1.
4. If you changed the `authEnabled` configuration, existing clients must be updated to reflect the change.
