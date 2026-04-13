-- 1. Fix automation_content_feedback
DROP POLICY IF EXISTS "Service role full access" ON public.automation_content_feedback;

CREATE POLICY "Users can view feedback for their workspace clients"
ON public.automation_content_feedback
FOR SELECT
TO authenticated
USING (
  client_workspace_accessible(client_id, auth.uid())
);

CREATE POLICY "Members can create feedback"
ON public.automation_content_feedback
FOR INSERT
TO authenticated
WITH CHECK (
  client_workspace_accessible(client_id, auth.uid())
  AND can_modify_data(auth.uid())
);

CREATE POLICY "Admins can delete feedback"
ON public.automation_content_feedback
FOR DELETE
TO authenticated
USING (
  client_id IS NOT NULL AND client_workspace_accessible(client_id, auth.uid())
  AND can_delete_in_workspace(auth.uid())
);

-- 2. Fix performance_reports SELECT policy
DROP POLICY IF EXISTS "Users can view reports for clients they have access to" ON public.performance_reports;

CREATE POLICY "Users can view reports for clients in their workspace"
ON public.performance_reports
FOR SELECT
TO authenticated
USING (
  client_workspace_accessible(client_id, auth.uid())
);