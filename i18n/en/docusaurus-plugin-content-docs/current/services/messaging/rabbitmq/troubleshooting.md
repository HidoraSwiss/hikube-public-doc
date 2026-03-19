---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — RabbitMQ

### Queue blocked (flow control)

**Cause**: RabbitMQ has triggered a **memory alarm** or **disk alarm**, blocking publications to protect the system. This occurs when memory consumption exceeds the threshold (high watermark) or when disk space is insufficient.

**Solution**:

1. Check cluster status and active alarms:
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl status | grep -A 10 "alarms"
   ```
2. Identify the resource causing the issue (memory or disk):
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl status | grep -E "mem_|disk_"
   ```
3. Increase allocated resources in your manifest:
   ```yaml title="rabbitmq.yaml"
   replicas: 3
   resources:
     cpu: 1
     memory: 2Gi
   size: 20Gi
   ```
4. Purge unused queues if necessary:
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl purge_queue <queue-name>
   ```

### RabbitMQ node not joining the cluster

**Cause**: a RabbitMQ node cannot join the cluster, often due to DNS resolution issues, Erlang cookie inconsistency, or restrictive network policies.

**Solution**:

1. Check cluster status from a working node:
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl cluster_status
   ```
2. Check the logs of the failing pod:
   ```bash
   kubectl logs <problematic-rabbitmq-pod>
   ```
3. Verify DNS resolution works between pods:
   ```bash
   kubectl exec <rabbitmq-pod> -- nslookup <problematic-rabbitmq-pod>.<headless-service>
   ```
4. If the problem persists, delete the failing pod to force its recreation:
   ```bash
   kubectl delete pod <problematic-rabbitmq-pod>
   ```

### Messages not routed (misconfigured exchange)

**Cause**: published messages are not reaching queues, usually because of a wrong exchange type, incorrect routing key, or missing binding between the exchange and the queue.

**Solution**:

1. List existing bindings to identify configured routes:
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl list_bindings -p <vhost>
   ```
2. Check the exchange type and expected routing key:
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl list_exchanges -p <vhost>
   ```
3. Configure a **dead letter exchange** to capture unrouted messages and facilitate diagnosis:
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl set_policy DLX ".*" '{"dead-letter-exchange":"dlx"}' -p <vhost>
   ```
4. Verify that the producer uses the correct exchange and routing key in its configuration

### Memory saturated (memory alarm)

**Cause**: RabbitMQ has reached the memory threshold (**high watermark**, 40% of available memory by default). All publications are blocked until memory drops below the threshold.

**Solution**:

1. Check memory consumption:
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl status | grep "mem_used"
   ```
2. Identify the largest queues:
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl list_queues name messages memory -p <vhost> --formatter table
   ```
3. Increase memory allocated to RabbitMQ:
   ```yaml title="rabbitmq.yaml"
   resources:
     cpu: 1
     memory: 4Gi
   ```
4. Purge unused queues or queues containing a large number of unconsumed messages

### AMQP connection refused

**Cause**: the client cannot connect to the RabbitMQ broker. This can be due to incorrect credentials, missing vhost permissions, or a network accessibility issue.

**Solution**:

1. Check connection credentials in the Kubernetes Secret:
   ```bash
   kubectl get secret <rabbitmq-name>-credentials -o jsonpath='{.data}' | base64 -d
   ```
2. Verify the user has the necessary permissions on the vhost:
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmqctl list_permissions -p <vhost>
   ```
3. Test connectivity to the AMQP port (5672):
   ```bash
   kubectl exec <rabbitmq-pod> -- rabbitmq-diagnostics check_port_connectivity
   ```
4. If connecting from outside the cluster, make sure `external: true` is configured in your manifest
